import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseShiftDate, tpeWeekDates } from "@/lib/shifts";

/**
 * GET /api/me/shifts?weekStart=YYYY-MM-DD
 * 預設取本週 (週一 ~ 週日)。只回傳已發佈的班表 (publishedAt != null)
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  let weekStart = url.searchParams.get("weekStart");
  if (!weekStart) {
    weekStart = tpeWeekDates()[0];
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return NextResponse.json({ error: "weekStart 格式錯誤" }, { status: 400 });
  }
  const start = parseShiftDate(weekStart);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60_000);

  const shifts = await prisma.shiftAssignment.findMany({
    where: {
      userId: session.userId,
      date: { gte: start, lt: end },
      publishedAt: { not: null },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    weekStart,
    days: tpeWeekDates(start),
    shifts: shifts.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      startTime: s.startTime,
      endTime: s.endTime,
      isOff: s.isOff,
      note: s.note,
    })),
  });
}
