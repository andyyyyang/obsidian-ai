import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeToUtc, tpeWeekRange } from "@/lib/tz";

const shiftSchema = z.object({
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  note: z.string().max(120).nullable().optional(),
});

const postSchema = z.object({
  assignments: z.array(shiftSchema),
  publish: z.boolean().default(false),
});

// GET 取得某週班表
// ?weekStart=YYYY-MM-DD  ← 該週週一
// ?userId=...            ← 只看某員工
export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart");
  const userId = url.searchParams.get("userId");

  const week = weekStart
    ? tpeWeekRange(new Date(`${weekStart}T00:00:00+08:00`))
    : tpeWeekRange();

  const isMod = session.role === "ADMIN" || session.role === "MANAGER";

  const shifts = await prisma.shiftAssignment.findMany({
    where: {
      date: { gte: week.start, lt: week.end },
      ...(userId ? { userId } : {}),
      // 一般員工只看已發佈的；主管/admin 看全部 (含草稿)
      ...(isMod ? {} : { publishedAt: { not: null } }),
    },
    include: { user: { select: { id: true, name: true, employeeNo: true, department: true } } },
    orderBy: [{ user: { employeeNo: "asc" } }, { date: "asc" }],
  });

  return NextResponse.json({
    weekStart: week.days[0],
    days: week.days,
    shifts: shifts.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user.name,
      employeeNo: s.user.employeeNo,
      department: s.user.department,
      date: new Date(s.date.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      note: s.note,
      isPublished: s.publishedAt != null,
    })),
  });
}

// POST 主管批次儲存班表
// publish=true 表示同時發佈（員工可見）
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const now = new Date();
  const ops = parsed.data.assignments.map((a) => {
    const date = tpeToUtc(a.date, "00:00");
    const payload = {
      startTime: a.startTime,
      endTime: a.endTime,
      note: a.note ?? null,
      ...(parsed.data.publish
        ? { publishedAt: now, publishedById: session.userId! }
        : {}),
    };
    return prisma.shiftAssignment.upsert({
      where: { userId_date: { userId: a.userId, date } },
      create: {
        userId: a.userId,
        date,
        startTime: a.startTime,
        endTime: a.endTime,
        note: a.note ?? null,
        publishedAt: parsed.data.publish ? now : null,
        publishedById: parsed.data.publish ? session.userId! : null,
      },
      update: payload,
    });
  });
  await prisma.$transaction(ops);

  return NextResponse.json({ ok: true, count: ops.length });
}
