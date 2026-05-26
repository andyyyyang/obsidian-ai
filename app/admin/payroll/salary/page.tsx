import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { ntd } from "@/lib/payroll";
import { SalaryEditor } from "./salary-editor";

export const dynamic = "force-dynamic";

const SALARY_LABEL: Record<string, string> = {
  MONTHLY: "月薪",
  HOURLY: "時薪",
  DAILY: "日薪",
};

export default async function SalarySettingsPage() {
  const [users, schedules] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      orderBy: [{ department: "asc" }, { employeeNo: "asc" }],
      include: {
        salaryConfigs: {
          where: { OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
        },
        scheduleAssignments: {
          where: { OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
          include: { schedule: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.workSchedule.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/admin/payroll" className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回薪資管理
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Wallet className="h-6 w-6" />
          員工薪資與班別設定
        </h1>
        <p className="mt-1 text-sm text-slate-500">設定基本薪資、勞健保自負額、全勤獎金與工作班別</p>
      </div>

      <div className="space-y-3">
        {users.map((u) => {
          const config = u.salaryConfigs[0];
          const assignment = u.scheduleAssignments[0];
          return (
            <GlassCard key={u.id} variant="strong" className="p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {u.employeeNo} · {u.department ?? "—"}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {config ? (
                    <>
                      <div className="text-slate-900">{SALARY_LABEL[config.type]} {ntd(config.amount)}</div>
                      <div className="text-xs text-slate-500">班別：{assignment?.schedule.name ?? "未指派"}</div>
                    </>
                  ) : (
                    <div className="text-rose-500">尚未設定薪資</div>
                  )}
                </div>
              </div>
              <SalaryEditor
                userId={u.id}
                schedules={schedules}
                currentScheduleId={assignment?.schedule.id ?? ""}
                initialConfig={
                  config
                    ? {
                        type: config.type,
                        amount: config.amount,
                        fullAttendanceBonus: config.fullAttendanceBonus,
                        lateDeductionPerMinute: config.lateDeductionPerMinute,
                        leaveDeductPerDay: config.leaveDeductPerDay,
                        laborInsurance: config.laborInsurance,
                        healthInsurance: config.healthInsurance,
                        laborPensionSelf: config.laborPensionSelf,
                      }
                    : null
                }
              />
            </GlassCard>
          );
        })}
      </div>
    </main>
  );
}
