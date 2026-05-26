import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Calendar, LogIn, LogOut, Coffee, RotateCcw } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeDateString } from "@/lib/tz";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, { text: string; tone: string; icon: any }> = {
  CLOCK_IN: { text: "上班", tone: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: LogIn },
  CLOCK_OUT: { text: "下班", tone: "text-rose-700 bg-rose-50 border-rose-200", icon: LogOut },
  BREAK_OUT: { text: "休息", tone: "text-amber-700 bg-amber-50 border-amber-200", icon: Coffee },
  BREAK_IN: { text: "回崗", tone: "text-sky-700 bg-sky-50 border-sky-200", icon: RotateCcw },
};

export default async function AttendancePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  // 撈最近 60 天
  const since = new Date(Date.now() - 60 * 24 * 60 * 60_000);
  const punches = await prisma.attendance.findMany({
    where: { userId: session.userId, punchedAt: { gte: since } },
    orderBy: { punchedAt: "desc" },
    include: { restaurant: { select: { name: true } } },
  });

  // 依日期分組
  const byDate = new Map<string, typeof punches>();
  for (const p of punches) {
    const ds = tpeDateString(p.punchedAt);
    const arr = byDate.get(ds) ?? [];
    arr.push(p);
    byDate.set(ds, arr);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <PageHeader
        title="我的出勤紀錄"
        subtitle="最近 60 天"
        back={{ href: "/", label: "回餐廳" }}
      />

      {byDate.size === 0 ? (
        <GlassCard variant="strong" className="p-10 text-center text-sm text-slate-500">
          還沒有任何打卡紀錄
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {Array.from(byDate.entries()).map(([date, list]) => {
            const totalWorked = computeWorked(list);
            return (
              <GlassCard key={date} variant="strong" className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {date}
                    <span className="text-xs font-normal text-slate-400">
                      {weekday(date)}
                    </span>
                  </h3>
                  {totalWorked && (
                    <span className="rounded-full bg-emerald-100/80 px-3 py-0.5 text-xs font-medium text-emerald-800">
                      工時 {totalWorked}
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {list
                    .slice()
                    .sort((a, b) => a.punchedAt.getTime() - b.punchedAt.getTime())
                    .map((p) => {
                      const info = TYPE_LABEL[p.type];
                      const Icon = info?.icon ?? LogIn;
                      return (
                        <li
                          key={p.id}
                          className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${info?.tone ?? ""}`}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <Icon className="h-4 w-4" />
                            {info?.text ?? p.type}
                          </span>
                          <span className="flex items-center gap-2 tabular-nums">
                            <span>{format(p.punchedAt, "HH:mm:ss")}</span>
                            {p.restaurant?.name && (
                              <span className="text-xs opacity-70">@{p.restaurant.name}</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </GlassCard>
            );
          })}
        </div>
      )}
    </main>
  );
}

function weekday(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+08:00`);
  return d.toLocaleDateString("zh-TW", { weekday: "short", timeZone: "Asia/Taipei" });
}

function computeWorked(punches: { type: string; punchedAt: Date }[]): string | null {
  const sorted = [...punches].sort((a, b) => a.punchedAt.getTime() - b.punchedAt.getTime());
  const inP = sorted.find((p) => p.type === "CLOCK_IN");
  const outP = [...sorted].reverse().find((p) => p.type === "CLOCK_OUT");
  if (!inP || !outP) return null;

  let breakMs = 0;
  let breakStart: Date | undefined;
  for (const p of sorted) {
    if (p.type === "BREAK_OUT") breakStart = p.punchedAt;
    if (p.type === "BREAK_IN" && breakStart) {
      breakMs += p.punchedAt.getTime() - breakStart.getTime();
      breakStart = undefined;
    }
  }

  const totalMs = outP.punchedAt.getTime() - inP.punchedAt.getTime() - breakMs;
  if (totalMs <= 0) return null;
  const h = Math.floor(totalMs / 3600_000);
  const m = Math.round((totalMs % 3600_000) / 60_000);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
