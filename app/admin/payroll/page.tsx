import Link from "next/link";
import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tpeToday } from "@/lib/tz";
import { ntd } from "@/lib/payroll";
import { GlassCard } from "@/components/glass-card";
import { PayrollPanel } from "./payroll-panel";

export const dynamic = "force-dynamic";

type Search = { year?: string; month?: string };

export default async function AdminPayrollPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const todayStr = tpeToday();
  const [todayY, todayM] = todayStr.split("-").map(Number);
  const year = Number(sp.year) || todayY;
  const month = Number(sp.month) || todayM;

  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: [{ department: "asc" }, { employeeNo: "asc" }],
    include: {
      salaryConfigs: {
        where: { OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] },
        orderBy: { effectiveFrom: "desc" },
        take: 1,
      },
      payrolls: {
        where: { year, month },
      },
    },
  });

  const totalNet = users.reduce((s, u) => s + (u.payrolls[0]?.netPay ?? 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Receipt className="h-6 w-6" />
          薪資計算與管理
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          依據出勤紀錄與薪資設定產生月薪資單，可下載/列印給員工
        </p>
      </div>

      <PayrollPanel
        year={year}
        month={month}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          employeeNo: u.employeeNo,
          department: u.department,
          hasSalary: u.salaryConfigs.length > 0,
          salaryAmount: u.salaryConfigs[0]?.amount ?? null,
          salaryType: u.salaryConfigs[0]?.type ?? null,
          payroll: u.payrolls[0]
            ? {
                id: u.payrolls[0].id,
                netPay: u.payrolls[0].netPay,
                generatedAt: u.payrolls[0].generatedAt.toISOString(),
              }
            : null,
        }))}
      />

      <GlassCard className="mt-6 p-5 text-right">
        <span className="text-sm text-slate-500">本月薪資總額（已產生）：</span>
        <span className="ml-2 text-2xl font-bold tabular-nums">{ntd(totalNet)}</span>
      </GlassCard>

      <div className="mt-4 text-right">
        <Link href="/admin/payroll/salary" className="text-sm text-blue-600 hover:underline">
          設定員工薪資與勞健保 →
        </Link>
      </div>
    </main>
  );
}
