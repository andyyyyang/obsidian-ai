import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeMonthRange, tpeToday } from "@/lib/tz";
import { buildMonthlySummary, getEffectiveSchedule, rollupTotals } from "@/lib/attendance";

export async function GET(req: Request) {
  const session = await getSession();
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const todayStr = tpeToday();
  const [todayY, todayM] = todayStr.split("-").map(Number);
  const year = Number(url.searchParams.get("year")) || todayY;
  const month = Number(url.searchParams.get("month")) || todayM;
  const { start, end } = tpeMonthRange(year, month);
  const monthMid = new Date((start.getTime() + end.getTime()) / 2);

  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: [{ department: "asc" }, { employeeNo: "asc" }],
    select: { id: true, name: true, employeeNo: true, department: true },
  });

  const lines = ["員工編號,姓名,部門,應出勤,實出勤,缺勤,請假天數,遲到分鐘,早退分鐘,加班分鐘,總工時(時)"];
  for (const u of users) {
    const [schedule, punches, leaves] = await Promise.all([
      getEffectiveSchedule(u.id, monthMid),
      prisma.attendance.findMany({
        where: { userId: u.id, punchedAt: { gte: start, lt: end } },
        orderBy: { punchedAt: "asc" },
      }),
      prisma.leaveRequest.findMany({
        where: {
          requesterId: u.id,
          status: "APPROVED",
          startDate: { lt: end },
          endDate: { gte: start },
        },
        select: { startDate: true, endDate: true, days: true, isHalfDay: true },
      }),
    ]);
    const summaries = buildMonthlySummary({ year, month, schedule, punches, leaves });
    const t = rollupTotals(summaries);
    lines.push(
      [
        u.employeeNo,
        u.name,
        u.department ?? "",
        t.expectedDays,
        t.actualDays,
        t.absentDays,
        t.leaveDays,
        t.lateMinutes,
        t.earlyLeaveMinutes,
        t.overtimeMinutes,
        (t.totalMinutes / 60).toFixed(2),
      ].join(","),
    );
  }

  const csv = "﻿" + lines.join("\n"); // BOM for Excel
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${year}-${String(month).padStart(2, "0")}.csv"`,
    },
  });
}
