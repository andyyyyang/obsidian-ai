import Link from "next/link";
import { Clock, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tpeMonthRange, tpeToday } from "@/lib/tz";
import { buildMonthlySummary, getEffectiveSchedule, rollupTotals } from "@/lib/attendance";
import { GlassCard } from "@/components/glass-card";

export const dynamic = "force-dynamic";

type Search = { year?: string; month?: string };

export default async function AdminAttendancePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const todayStr = tpeToday();
  const [todayY, todayM] = todayStr.split("-").map(Number);
  const year = Number(sp.year) || todayY;
  const month = Number(sp.month) || todayM;
  const { start, end } = tpeMonthRange(year, month);
  const monthMid = new Date((start.getTime() + end.getTime()) / 2);

  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: [{ department: "asc" }, { employeeNo: "asc" }],
    select: { id: true, name: true, employeeNo: true, department: true },
  });

  const rows = await Promise.all(
    users.map(async (u) => {
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
      const totals = rollupTotals(summaries);
      return { ...u, totals };
    }),
  );

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Clock className="h-6 w-6" />
            員工出勤總覽
          </h1>
          <p className="mt-1 text-sm text-slate-500">{year} 年 {month} 月</p>
        </div>
        <div className="flex gap-2">
          <Link href={`?year=${prev.y}&month=${prev.m}`} className="btn-ghost">←</Link>
          <Link href={`?year=${next.y}&month=${next.m}`} className="btn-ghost">→</Link>
          <a href={`/api/admin/attendance/export?year=${year}&month=${month}`} className="btn-primary">
            <Download className="h-4 w-4" />
            匯出 CSV
          </a>
        </div>
      </div>

      <GlassCard variant="strong" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">員工</th>
                <th className="px-3 py-3">部門</th>
                <th className="px-3 py-3 text-right">應出勤</th>
                <th className="px-3 py-3 text-right">實出勤</th>
                <th className="px-3 py-3 text-right">缺勤</th>
                <th className="px-3 py-3 text-right">請假</th>
                <th className="px-3 py-3 text-right">遲到(分)</th>
                <th className="px-3 py-3 text-right">總工時</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.employeeNo}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{u.department ?? "—"}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{u.totals.expectedDays}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{u.totals.actualDays}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {u.totals.absentDays > 0 ? (
                      <span className="text-rose-600">{u.totals.absentDays}</span>
                    ) : (
                      u.totals.absentDays
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{u.totals.leaveDays}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {u.totals.lateMinutes > 0 ? (
                      <span className="text-rose-600">{u.totals.lateMinutes}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {(u.totals.totalMinutes / 60).toFixed(1)} h
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/attendance/${u.id}?year=${year}&month=${month}`} className="text-sm text-blue-600 hover:underline">
                      明細
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                    沒有員工資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </main>
  );
}
