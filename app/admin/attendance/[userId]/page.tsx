import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tpeMonthRange, tpeToday } from "@/lib/tz";
import { buildMonthlySummary, getEffectiveSchedule, rollupTotals } from "@/lib/attendance";
import { GlassCard } from "@/components/glass-card";
import { AttendanceTable } from "@/app/attendance/attendance-table";

export const dynamic = "force-dynamic";

type Params = { userId: string };
type Search = { year?: string; month?: string };

export default async function AdminUserAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { userId } = await params;
  const sp = await searchParams;
  const todayStr = tpeToday();
  const [todayY, todayM] = todayStr.split("-").map(Number);
  const year = Number(sp.year) || todayY;
  const month = Number(sp.month) || todayM;
  const { start, end } = tpeMonthRange(year, month);
  const monthMid = new Date((start.getTime() + end.getTime()) / 2);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, employeeNo: true, department: true },
  });
  if (!user) notFound();

  const [schedule, punches, leaves] = await Promise.all([
    getEffectiveSchedule(userId, monthMid),
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

  const summaries = buildMonthlySummary({ year, month, schedule, punches, leaves });
  const totals = rollupTotals(summaries);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href={`/admin/attendance?year=${year}&month=${month}`} className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.employeeNo} · {user.department ?? "—"} · {year} 年 {month} 月
          {schedule ? ` · 班別 ${schedule.name}` : ""}
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="應出勤" value={`${totals.expectedDays} 天`} />
        <Stat label="實出勤" value={`${totals.actualDays} 天`} />
        <Stat label="總工時" value={`${(totals.totalMinutes / 60).toFixed(1)} h`} />
        <Stat label="遲到" value={`${totals.lateMinutes} 分`} alert={totals.lateMinutes > 0} />
      </div>

      <GlassCard variant="strong" className="p-6">
        <AttendanceTable summaries={summaries} />
      </GlassCard>
    </main>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <GlassCard className="p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${alert ? "text-rose-600" : "text-slate-900"}`}>
        {value}
      </div>
    </GlassCard>
  );
}
