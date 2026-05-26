import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ntd } from "@/lib/payroll";
import { GlassCard } from "@/components/glass-card";

export const dynamic = "force-dynamic";

export default async function PayrollListPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const payrolls = await prisma.payroll.findMany({
    where: { userId: session.userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">我的薪資單</h1>

      {payrolls.length === 0 ? (
        <GlassCard className="p-12 text-center text-sm text-slate-500">
          目前尚未有任何薪資紀錄
        </GlassCard>
      ) : (
        <ul className="space-y-2">
          {payrolls.map((p) => (
            <li key={p.id}>
              <Link
                href={`/payroll/${p.id}`}
                className="glass-subtle glass-hoverable flex items-center justify-between rounded-2xl px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {p.year} 年 {p.month} 月
                    </div>
                    <div className="text-xs text-slate-500">
                      實際出勤 {p.actualDays} 天 · 工時 {(p.totalMinutes / 60).toFixed(1)} h
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-slate-900 tabular-nums">{ntd(p.netPay)}</div>
                  <div className="text-xs text-slate-500">實領</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
