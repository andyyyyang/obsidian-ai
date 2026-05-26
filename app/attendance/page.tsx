import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileEdit } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeMonthRange, tpeToday } from "@/lib/tz";
import { buildMonthlySummary, getEffectiveSchedule, rollupTotals } from "@/lib/attendance";
import { GlassCard } from "@/components/glass-card";
import { AttendanceTable } from "./attendance-table";

export const dynamic = "force-dynamic";

type Search = { year?: string; month?: string };

export default async function AttendancePage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const sp = await searchParams;
  const today = new Date();
  const todayStr = tpeToday();
  const [todayY, todayM] = todayStr.split("-").map(Number);
  const year = Number(sp.year) || todayY;
  const month = Number(sp.month) || todayM;

  const { start, end } = tpeMonthRange(year, month);
  const monthMid = new Date((start.getTime() + end.getTime()) / 2);

  const [schedule, punches, leaves] = await Promise.all([
    getEffectiveSchedule(session.userId, monthMid),
    prisma.attendance.findMany({
      where: {
        userId: session.userId,
        punchedAt: { gte: start, lt: end },
      },
      orderBy: { punchedAt: "asc" },
    }),
    prisma.leaveRequest.findMany({
      where: {
        requesterId: session.userId,
        status: "APPROVED",
        startDate: { lt: end },
        endDate: { gte: start },
      },
      select: { startDate: true, endDate: true, days: true, isHalfDay: true },
    }),
  ]);

  const summaries = buildMonthlySummary({ year, month, schedule, punches, leaves, now: today });
  const totals = rollupTotals(summaries);

  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <Link href="/clock" className="btn-primary">
          <Clock className="h-4 w-4" />
          去打卡
        </Link>
      </div>

      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">我的出勤</h1>
          <p className="mt-1 text-sm text-slate-500">
            {year} 年 {month} 月 {schedule ? `· 班別 ${schedule.name}` : "· 尚未指派班別"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`?year=${prevMonth.y}&month=${prevMonth.m}`} className="btn-ghost">←</Link>
          <Link href={`?year=${nextMonth.y}&month=${nextMonth.m}`} className="btn-ghost">→</Link>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="應出勤" value={`${totals.expectedDays} 天`} />
        <Stat label="實際出勤" value={`${totals.actualDays} 天`} />
        <Stat label="總工時" value={`${(totals.totalMinutes / 60).toFixed(1)} h`} />
        <Stat label="遲到" value={`${totals.lateMinutes} 分`} alert={totals.lateMinutes > 0} />
      </div>

      <GlassCard variant="strong" className="p-6">
        <AttendanceTable summaries={summaries} />
      </GlassCard>

      <div className="mt-6 text-center">
        <Link href="/attendance/correction/new" className="text-sm text-slate-500 underline-offset-4 hover:underline">
          <FileEdit className="mr-1 inline h-3.5 w-3.5" />
          補打卡申請
        </Link>
      </div>
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
