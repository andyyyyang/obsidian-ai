import { prisma } from "@/lib/prisma";
import { tpeWeekDates } from "@/lib/shifts";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";
import { ShiftImporter } from "./shift-importer";

export const dynamic = "force-dynamic";

export default async function AdminShiftsPage() {
  const employees = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, employeeNo: true, name: true },
    orderBy: { employeeNo: "asc" },
  });

  const weekDays = tpeWeekDates();
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  const startDate = new Date(`${weekStart}T00:00:00+08:00`);
  const endDate = new Date(new Date(`${weekEnd}T00:00:00+08:00`).getTime() + 24 * 60 * 60_000);

  const existingShifts = await prisma.shiftAssignment.findMany({
    where: { date: { gte: startDate, lt: endDate } },
    include: { user: { select: { id: true, employeeNo: true, name: true } } },
    orderBy: [{ date: "asc" }, { user: { employeeNo: "asc" } }],
  });

  // 用 Map<userId, Map<dateStr, shift>>
  const byUserDay = new Map<string, Map<string, typeof existingShifts[number]>>();
  for (const sh of existingShifts) {
    const ds = sh.date.toISOString().slice(0, 10);
    if (!byUserDay.has(sh.userId)) byUserDay.set(sh.userId, new Map());
    byUserDay.get(sh.userId)!.set(ds, sh);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="班表管理"
        subtitle={`本週 ${weekStart} ~ ${weekEnd}`}
      />

      <GlassCard variant="strong" className="mb-6 p-6">
        <ShiftImporter
          employees={employees.map((e) => ({ employeeNo: e.employeeNo, name: e.name }))}
        />
      </GlassCard>

      <GlassCard variant="strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <Th className="sticky left-0 bg-white/80">員工</Th>
                {weekDays.map((d) => (
                  <Th key={d}>
                    {d.slice(5)}
                    <span className="ml-1 font-normal text-slate-400">{weekday(d)}</span>
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-white/40">
                  <Td className="sticky left-0 bg-white/80 font-medium">
                    <div className="text-xs text-slate-400">{e.employeeNo}</div>
                    {e.name}
                  </Td>
                  {weekDays.map((d) => {
                    const sh = byUserDay.get(e.id)?.get(d);
                    if (!sh) {
                      return <Td key={d} className="text-xs text-slate-300">—</Td>;
                    }
                    if (sh.isOff) {
                      return (
                        <Td key={d}>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">休</span>
                        </Td>
                      );
                    }
                    return (
                      <Td key={d}>
                        <div className="text-xs font-medium text-slate-900">
                          {sh.startTime}–{sh.endTime}
                        </div>
                        {sh.note && <div className="text-[10px] text-slate-500">{sh.note}</div>}
                        {!sh.publishedAt && (
                          <div className="text-[10px] text-amber-600">草稿</div>
                        )}
                      </Td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </main>
  );
}

function weekday(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+08:00`);
  return d.toLocaleDateString("zh-TW", { weekday: "short", timeZone: "Asia/Taipei" });
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-3 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 ${className}`}>{children}</td>;
}
