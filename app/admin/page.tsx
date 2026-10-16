import Link from "next/link";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import {
  AlertTriangle,
  ArrowUpRight,
  Cake,
  CalendarRange,
  ClipboardList,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { LeaveStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentAnniversaryYear } from "@/lib/leave";
import { getBalance } from "@/lib/balance";
import { getUpcomingBirthdays, getUpcomingAnniversaries } from "@/lib/widgets";
import { GlassCard } from "@/components/glass-card";
import { Avatar } from "@/components/avatar";
import { DeptPieChart, MonthlyApprovedChart } from "@/components/admin-charts";

export const dynamic = "force-dynamic";

async function getMonthlyApproved(): Promise<{ month: string; days: number }[]> {
  const now = new Date();
  const months: { start: Date; end: Date; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = startOfMonth(addMonths(now, -i));
    const end = startOfMonth(addMonths(start, 1));
    months.push({ start, end, label: format(start, "yyyy-MM") });
  }

  const results = await Promise.all(
    months.map(async (m) => {
      const agg = await prisma.leaveRequest.aggregate({
        where: { status: LeaveStatus.APPROVED, startDate: { gte: m.start, lt: m.end } },
        _sum: { days: true },
      });
      return { month: m.label.slice(5), days: agg._sum.days ?? 0 };
    }),
  );
  return results;
}

async function getDeptBreakdown(): Promise<{ department: string; days: number }[]> {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const requests = await prisma.leaveRequest.findMany({
    where: { status: LeaveStatus.APPROVED, startDate: { gte: yearStart } },
    include: { requester: { select: { department: true } } },
  });
  const map = new Map<string, number>();
  for (const r of requests) {
    const dept = r.requester.department ?? "未分配";
    map.set(dept, (map.get(dept) ?? 0) + r.days);
  }
  return Array.from(map.entries())
    .map(([department, days]) => ({ department, days }))
    .sort((a, b) => b.days - a.days);
}

export default async function AdminHome() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    userCount,
    pendingCount,
    allUsers,
    payoutCount,
    monthly,
    dept,
    thisMonthApproved,
    thisMonthPending,
    birthdays,
    anniversaries,
  ] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
    prisma.user.findMany({
      select: { id: true, name: true, department: true, hireDate: true, active: true },
    }),
    prisma.leavePayout.count(),
    getMonthlyApproved(),
    getDeptBreakdown(),
    prisma.leaveRequest.aggregate({
      where: {
        status: LeaveStatus.APPROVED,
        AND: [{ startDate: { lte: monthEnd } }, { endDate: { gte: monthStart } }],
      },
      _sum: { days: true },
      _count: true,
    }),
    prisma.leaveRequest.count({
      where: {
        status: LeaveStatus.PENDING,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    getUpcomingBirthdays(14),
    getUpcomingAnniversaries(14),
  ]);

  // 計算待結算折發 + 剩餘天數警示
  let pendingPayout = 0;
  const lowRemaining: { id: string; name: string; department: string | null; remaining: number; entitlement: number }[] = [];

  await Promise.all(
    allUsers
      .filter((u) => u.active)
      .map(async (u) => {
        const cur = getCurrentAnniversaryYear(u.hireDate, now);
        if (cur && cur.yearIndex >= 1) {
          const prevStart = new Date(cur.start);
          prevStart.setFullYear(prevStart.getFullYear() - 1);
          const has = await prisma.leavePayout.findFirst({
            where: { userId: u.id, anniversaryYearStart: prevStart },
            select: { id: true },
          });
          if (!has) pendingPayout += 1;
        }

        // 剩餘天數警示：剩餘 >= 10 天且離週期結束 < 60 天的人需要安排折發
        const balance = await getBalance(u.id).catch(() => null);
        if (balance && balance.year && balance.annualLeaveEnabled) {
          const daysToEnd =
            (balance.year.end.getTime() - now.getTime()) / 86400000;
          if (daysToEnd < 60 && balance.remaining >= 10) {
            lowRemaining.push({
              id: u.id,
              name: u.name,
              department: u.department,
              remaining: balance.remaining,
              entitlement: balance.entitlement + balance.adjustments,
            });
          }
        }
      }),
  );
  lowRemaining.sort((a, b) => b.remaining - a.remaining);

  const thisMonthDays = thisMonthApproved._sum.days ?? 0;
  const thisMonthLeaveCount = thisMonthApproved._count ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">總覽</h1>
          <p className="mt-1 text-sm text-slate-500">
            {format(now, "yyyy 年 MM 月 dd 日")} · 公司目前的員工與請假狀況
          </p>
        </div>
      </div>

      {/* 核心 KPI */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card
          href="/admin/users"
          label="在職員工"
          value={userCount}
          suffix="人"
          icon={<Users className="h-5 w-5" />}
          tone="blue"
        />
        <Card
          href="/approvals"
          label="待審申請"
          value={pendingCount}
          suffix="筆"
          icon={<ClipboardList className="h-5 w-5" />}
          tone={pendingCount > 0 ? "amber" : "blue"}
        />
        <Card
          href="/admin/payouts"
          label="待結算折發"
          value={pendingPayout}
          suffix="人"
          icon={<Wallet className="h-5 w-5" />}
          tone={pendingPayout > 0 ? "amber" : "blue"}
        />
        <Card
          href="/admin/payouts"
          label="已結算折發"
          value={payoutCount}
          suffix="筆"
          icon={<Wallet className="h-5 w-5" />}
          tone="green"
        />
      </div>

      {/* 本月快照 */}
      <GlassCard variant="strong" className="mb-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-ios-indigo flex-shrink-0" />
          <h2 className="text-sm font-semibold text-slate-900">本月快照</h2>
          <span className="text-xs text-slate-500">
            （{format(monthStart, "MM/dd")} ~ {format(monthEnd, "MM/dd")}）
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <MiniStat label="本月請假天數" value={thisMonthDays} suffix="天" accent="blue" />
          <MiniStat label="本月請假筆數" value={thisMonthLeaveCount} suffix="筆" accent="indigo" />
          <MiniStat label="本月新進申請" value={thisMonthPending} suffix="筆" accent="amber" />
          <MiniStat
            label="平均每人請假"
            value={userCount > 0 ? Math.round((thisMonthDays / userCount) * 10) / 10 : 0}
            suffix="天"
            accent="purple"
          />
        </div>
      </GlassCard>

      {/* 剩餘天數警示 */}
      {lowRemaining.length > 0 && (
        <GlassCard variant="strong" className="mb-6 p-6 border border-amber-300/40 dark:border-amber-500/20">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-900">
              快要用不完的員工（週期剩 &lt; 60 天、剩餘 ≥ 10 天）
            </h2>
            <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              {lowRemaining.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowRemaining.slice(0, 8).map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="glass-subtle group inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs hover:bg-white/60"
              >
                <Avatar name={u.name} size="sm" />
                <span className="font-medium">{u.name}</span>
                {u.department && <span className="text-slate-400">· {u.department}</span>}
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  剩 {u.remaining} / {u.entitlement}
                </span>
              </Link>
            ))}
            {lowRemaining.length > 8 && (
              <Link
                href="/admin/balances"
                className="inline-flex items-center gap-1 text-xs text-ios-blue hover:underline"
              >
                還有 {lowRemaining.length - 8} 位 → 到餘額頁查看
              </Link>
            )}
          </div>
        </GlassCard>
      )}

      {/* 近期生日 / 週年快速瀏覽 */}
      {(birthdays.length > 0 || anniversaries.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {birthdays.length > 0 && (
            <GlassCard variant="strong" className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Cake className="h-4 w-4 flex-shrink-0 text-rose-500" />
                <h3 className="text-sm font-semibold text-slate-900">未來 14 天生日</h3>
                <span className="text-xs text-slate-400">({birthdays.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {birthdays.slice(0, 6).map((b) => (
                  <span key={b.userId} className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1 text-xs">
                    <Avatar name={b.name} size="sm" />
                    <span className="font-medium">{b.name}</span>
                    <span className="text-slate-500">
                      {b.daysAway === 0 ? "今天" : `${b.daysAway}天後`}
                    </span>
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
          {anniversaries.length > 0 && (
            <GlassCard variant="strong" className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarRange className="h-4 w-4 flex-shrink-0 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-900">未來 14 天週年</h3>
                <span className="text-xs text-slate-400">({anniversaries.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {anniversaries.slice(0, 6).map((a) => (
                  <span key={a.userId} className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1 text-xs">
                    <Avatar name={a.name} size="sm" />
                    <span className="font-medium">{a.name}</span>
                    <span className="text-gradient font-semibold">{a.years} 週年</span>
                    <span className="text-slate-500">
                      {a.daysAway === 0 ? "今天" : `${a.daysAway}天後`}
                    </span>
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* 圖表 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard variant="strong" className="p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">近 6 個月已核准請假天數</h2>
          <p className="mb-4 text-xs text-slate-500">依「起始日」歸月份</p>
          <MonthlyApprovedChart data={monthly} />
        </GlassCard>
        <GlassCard variant="strong" className="p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">本年度部門請假分佈</h2>
          <p className="mb-4 text-xs text-slate-500">{format(now, "yyyy")} 年已核准</p>
          <DeptPieChart data={dept} />
        </GlassCard>
      </div>
    </main>
  );
}

const tones = {
  blue: { icon: "bg-ios-blue/15 text-ios-blue", value: "text-slate-900" },
  amber: {
    icon: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  green: {
    icon: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    value: "text-slate-900",
  },
};

function Card({
  href,
  label,
  value,
  suffix,
  icon,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  tone: keyof typeof tones;
}) {
  const t = tones[tone];
  return (
    <Link href={href} className="group">
      <GlassCard variant="strong" hoverable className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl md:h-10 md:w-10 ${t.icon}`}>
            {icon}
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <div className="mt-3 text-xs text-slate-500 md:text-sm">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className={`text-3xl font-bold tracking-tight tabular-nums md:text-4xl ${t.value}`}>
            {value}
          </span>
          {suffix && <span className="text-xs text-slate-400 md:text-sm">{suffix}</span>}
        </div>
      </GlassCard>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix: string;
  accent: "blue" | "indigo" | "amber" | "purple";
}) {
  const accentClass = {
    blue: "text-ios-blue",
    indigo: "text-ios-indigo",
    amber: "text-amber-600 dark:text-amber-400",
    purple: "text-ios-purple",
  }[accent];
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${accentClass}`}>{value}</span>
        <span className="text-xs text-slate-400">{suffix}</span>
      </div>
    </div>
  );
}
