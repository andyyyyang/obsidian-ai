import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/balance";
import { GlassCard } from "@/components/glass-card";
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">餘額調整</h1>
      <p className="mb-6 text-sm text-slate-500">
        每位員工本年度的特休狀況；點週期可改到職日、點調整欄可看歷史
      </p>

      <GlassCard variant="strong" className="overflow-hidden animate-fade-in">
        <BalancesClient rows={rows} departments={departments} />
      </GlassCard>
    </main>
  );
}
