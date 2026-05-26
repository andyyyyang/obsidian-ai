import { NextResponse } from "next/server";
import { z } from "zod";
import { PunchType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeToUtc } from "@/lib/tz";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.nativeEnum(PunchType),
  reason: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const proposedTime = tpeToUtc(parsed.data.date, parsed.data.time);
  const targetDate = tpeToUtc(parsed.data.date, "00:00");

  const created = await prisma.attendanceCorrection.create({
    data: {
      userId: session.userId,
      targetDate,
      type: parsed.data.type,
      proposedTime,
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
