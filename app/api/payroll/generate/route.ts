import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeMonthRange } from "@/lib/tz";
import {
  buildMonthlySummary,
  getEffectiveSchedule,
  rollupTotals,
} from "@/lib/attendance";
import { calculateNetPay, calculatePayroll } from "@/lib/payroll";

const schema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  overwrite: z.boolean().default(false),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const { userIds, year, month, overwrite } = parsed.data;
  const { start, end } = tpeMonthRange(year, month);
  const monthMid = new Date((start.getTime() + end.getTime()) / 2);

  const results: Array<{ userId: string; status: string; payrollId?: string; error?: string }> = [];

  for (const userId of userIds) {
    try {
      const existing = await prisma.payroll.findUnique({
        where: { userId_year_month: { userId, year, month } },
      });
      if (existing && !overwrite) {
        results.push({ userId, status: "skipped (already exists)" });
        continue;
      }

      const salaryConfig = await prisma.salaryConfig.findFirst({
        where: {
          userId,
          effectiveFrom: { lte: end },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: start } }],
        },
        orderBy: { effectiveFrom: "desc" },
      });
      if (!salaryConfig) {
        results.push({ userId, status: "error", error: "尚未設定薪資" });
        continue;
      }

      const schedule = await getEffectiveSchedule(userId, monthMid);

      const [punches, leaves] = await Promise.all([
        prisma.attendance.findMany({
          where: { userId, punchedAt: { gte: start, lt: end } },
          orderBy: { punchedAt: "asc" },
        }),
        prisma.leaveRequest.findMany({
          where: {
            requesterId: userId,
            status: "APPROVED",
            startDate: { lt: end },
            endDate: { gte: start },
          },
          select: { startDate: true, endDate: true, days: true, isHalfDay: true },
        }),
      ]);

      const summaries = buildMonthlySummary({
        year,
        month,
        schedule,
        punches,
        leaves,
      });
      const totals = rollupTotals(summaries);
      const breakdown = calculatePayroll(salaryConfig, totals);

      const netPay = calculateNetPay({
        ...breakdown,
        overtimePay: existing?.overtimePay ?? 0,
        otherBonus: existing?.otherBonus ?? 0,
        incomeTax: existing?.incomeTax ?? 0,
        otherDeduction: existing?.otherDeduction ?? 0,
      });

      const data = {
        userId,
        year,
        month,
        expectedDays: totals.expectedDays,
        actualDays: totals.actualDays,
        absentDays: totals.absentDays,
        leaveDays: totals.leaveDays,
        totalMinutes: totals.totalMinutes,
        lateMinutes: totals.lateMinutes,
        earlyLeaveMinutes: totals.earlyLeaveMinutes,
        overtimeMinutes: totals.overtimeMinutes,
        baseSalary: breakdown.baseSalary,
        fullAttendanceBonus: breakdown.fullAttendanceBonus,
        lateDeduction: breakdown.lateDeduction,
        leaveDeduction: breakdown.leaveDeduction,
        laborInsurance: breakdown.laborInsurance,
        healthInsurance: breakdown.healthInsurance,
        laborPensionSelf: breakdown.laborPensionSelf,
        overtimePay: existing?.overtimePay ?? 0,
        otherBonus: existing?.otherBonus ?? 0,
        incomeTax: existing?.incomeTax ?? 0,
        otherDeduction: existing?.otherDeduction ?? 0,
        netPay,
        note: existing?.note ?? null,
        generatedBy: session.userId,
      };

      const payroll = existing
        ? await prisma.payroll.update({
            where: { id: existing.id },
            data: { ...data, generatedAt: new Date() },
          })
        : await prisma.payroll.create({ data });

      results.push({ userId, status: existing ? "updated" : "created", payrollId: payroll.id });
    } catch (e) {
      results.push({
        userId,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ results });
}
