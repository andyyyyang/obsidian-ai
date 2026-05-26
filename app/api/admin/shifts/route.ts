import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseShiftImport, parseShiftDate } from "@/lib/shifts";

async function requireManager() {
  const session = await getSession();
  if (!session.userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

const importSchema = z.object({
  raw: z.string().min(1).max(50_000),
  publish: z.boolean().optional(),     // 立即發佈 (預設 true)
});

/**
 * POST /api/admin/shifts — TSV / CSV 批次匯入 (取代式 upsert)
 * 同一員工同一日期的舊資料會被新資料覆蓋
 */
export async function POST(req: Request) {
  const { error, session } = await requireManager();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = importSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "格式錯誤" }, { status: 400 });
  }

  const { ok, errors } = parseShiftImport(parsed.data.raw);
  if (errors.length > 0 && ok.length === 0) {
    return NextResponse.json({ imported: 0, errors }, { status: 400 });
  }

  // 員編對應到 userId
  const employeeNos = Array.from(new Set(ok.map((r) => r.employeeNo)));
  const users = await prisma.user.findMany({
    where: { employeeNo: { in: employeeNos } },
    select: { id: true, employeeNo: true },
  });
  const userMap = new Map(users.map((u) => [u.employeeNo, u.id]));

  const publish = parsed.data.publish !== false;
  const publishedAt = publish ? new Date() : null;
  const publishedById = publish ? session!.userId! : null;

  const created: string[] = [];
  const lineErrors = [...errors];

  for (const row of ok) {
    const userId = userMap.get(row.employeeNo);
    if (!userId) {
      lineErrors.push({ line: 0, message: `找不到員編 ${row.employeeNo}` });
      continue;
    }
    const date = parseShiftDate(row.date);
    await prisma.shiftAssignment.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        startTime: row.startTime,
        endTime: row.endTime,
        isOff: row.isOff,
        note: row.note,
        publishedAt,
        publishedById,
      },
      update: {
        startTime: row.startTime,
        endTime: row.endTime,
        isOff: row.isOff,
        note: row.note,
        publishedAt,
        publishedById,
      },
    });
    created.push(`${row.employeeNo}/${row.date}`);
  }

  return NextResponse.json({
    imported: created.length,
    skipped: lineErrors.length,
    errors: lineErrors,
  });
}

/** GET /api/admin/shifts?weekStart=YYYY-MM-DD — 取一週班表 */
export async function GET(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const url = new URL(req.url);
  const weekStart = url.searchParams.get("weekStart");
  if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return NextResponse.json({ error: "請帶 weekStart=YYYY-MM-DD" }, { status: 400 });
  }
  const start = parseShiftDate(weekStart);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60_000);

  const shifts = await prisma.shiftAssignment.findMany({
    where: { date: { gte: start, lt: end } },
    include: { user: { select: { id: true, name: true, employeeNo: true } } },
    orderBy: [{ date: "asc" }, { user: { employeeNo: "asc" } }],
  });

  return NextResponse.json({
    shifts: shifts.map((s) => ({
      id: s.id,
      userId: s.userId,
      employeeNo: s.user.employeeNo,
      employeeName: s.user.name,
      date: s.date.toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      isOff: s.isOff,
      note: s.note,
      published: !!s.publishedAt,
    })),
  });
}
