import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/balance";
import { GlassCard } from "@/components/glass-card";
import { TrendingUp, AlertTriangle, PieChart } from "lucide-react";
import { UsersIcon } from "@/components/icons/glass-icons";
import { BalancesClient, type BalanceRow } from "./balances-client";

export const dynamic = "force-dynamic";

export default async function AdminBalancesPage() {
  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: { employeeNo: "asc" },
    select: {
      id: true,
      employeeNo: true,
      name: true,
      department: true,
      hireDate: true,
    },
  });

  // 預撈所有可能的 admin / manager 名字，給調整紀錄顯示用
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER"] } },
    select: { id: true, name: true },
  });
  const adminNameMap = new Map(admins.map((a) => [a.id, a.name]));

  // 聚合每個 user 的 balance + 本年度 adjustment 詳細清單
  const rows: BalanceRow[] = await Promise.all(
    users.map(async (u) => {
      const balance = await getBalance(u.id);
      const adjustments = balance.year
        ? await prisma.balanceAdjustment.findMany({
            where: { userId: u.id, anniversaryYearStart: balance.year.start },
            orderBy: { createdAt: "desc" },
          })
        : [];
      return {
        id: u.id,
        employeeNo: u.employeeNo,
        name: u.name,
        department: u.department,
        hireDate: u.hireDate.toISOString(),
        balance: {
          year: balance.year
            ? {
                start: balance.year.start.toISOString(),
                end: balance.year.end.toISOString(),
              }
            : null,
          entitlement: balance.entitlement,
          adjustments: balance.adjustments,
          used: balance.used,
          pending: balance.pending,
          remaining: balance.remaining,
          annualLeaveEnabled: balance.annualLeaveEnabled,
        },
        adjustmentHistory: adjustments.map((a) => ({
          id: a.id,
          days: a.days,
          reason: a.reason,
          createdAt: a.createdAt.toISOString(),
          createdByName: adminNameMap.get(a.createdBy) ?? "—",
        })),
      };
    }),
  );

  // 收集所有部門做為篩選選項
  const departments = Array.from(
    new Set(users.map((u) => u.department).filter((d): d is string => !!d)),
  ).sort();

  // KPI 統計（只計享有特休的）
  const eligibleRows = rows.filter((r) => r.balance.annualLeaveEnabled && r.balance.year);
  const totalEntitlement = eligibleRows.reduce(
    (s, r) => s + r.balance.entitlement + r.balance.adjustments,
    0,
  );
  const totalUsed = eligibleRows.reduce((s, r) => s + r.balance.used, 0);
  const totalRemaining = eligibleRows.reduce((s, r) => s + r.balance.remaining, 0);
  const usagePct = totalEntitlement > 0 ? Math.round((totalUsed / totalEntitlement) * 100) : 0;
  const avgRemaining =
    eligibleRows.length > 0
      ? Math.round((totalRemaining / eligibleRows.length) * 10) / 10
      : 0;
  const warningCount = eligibleRows.filter((r) => {
    const total = r.balance.entitlement + r.balance.adjustments;
    return total > 0 && r.balance.remaining / total < 0.3;
  }).length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">餘額調整</h1>
      <p className="mb-6 text-sm text-slate-500">
        每位員工本年度的特休狀況；點週期可改到職日、點調整欄可看歷史
      </p>

      {/* KPI 摘要列 */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          icon={<UsersIcon className="h-4 w-4" />}
          label="享有特休員工"
          value={eligibleRows.length}
          suffix={`/ ${rows.length} 人`}
          accent="blue"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="本年度已核准"
          value={totalUsed}
          suffix={`天 (${usagePct}%)`}
          accent="indigo"
        />
        <KpiCard
          icon={<PieChart className="h-4 w-4" />}
          label="平均剩餘"
          value={avgRemaining}
          suffix="天 / 人"
          accent="purple"
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="剩 < 30%"
          value={warningCount}
          suffix="人"
          accent={warningCount > 0 ? "amber" : "blue"}
        />
      </div>

      <GlassCard variant="strong" className="overflow-hidden animate-fade-in">
        <BalancesClient rows={rows} departments={departments} />
      </GlassCard>
    </main>
  );
}

function KpiCard({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  accent: "blue" | "indigo" | "purple" | "amber";
}) {
  const accentClass = {
    blue: "bg-ios-blue/15 text-ios-blue",
    indigo: "bg-ios-indigo/15 text-ios-indigo",
    purple: "bg-ios-purple/15 text-ios-purple",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  }[accent];
  const valueColor = accent === "amber" ? "text-amber-600 dark:text-amber-400" : "text-slate-900";
  return (
    <GlassCard variant="strong" className="p-4">
      <div className={`mb-2 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${accentClass}`}>
        {icon}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</span>
        <span className="text-xs text-slate-400">{suffix}</span>
      </div>
    </GlassCard>
  );
}

