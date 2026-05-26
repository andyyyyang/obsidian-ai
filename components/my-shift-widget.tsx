import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tpeWeekDates, parseShiftDate } from "@/lib/shifts";
import { GlassCard } from "./glass-card";

export async function MyShiftWidget({ userId }: { userId: string }) {
  const days = tpeWeekDates();
  const start = parseShiftDate(days[0]);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60_000);

  const shifts = await prisma.shiftAssignment.findMany({
    where: {
      userId,
      date: { gte: start, lt: end },
      publishedAt: { not: null },
    },
    orderBy: { date: "asc" },
  });

  const byDate = new Map(shifts.map((s) => [s.date.toISOString().slice(0, 10), s]));

  const today = new Date();
  const tpeToday = new Date(today.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Calendar className="h-4 w-4 text-amber-600" />
          本週班表
        </h3>
        {shifts.length === 0 && (
          <span className="text-[10px] text-slate-400">店長尚未發佈</span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const s = byDate.get(d);
          const isToday = d === tpeToday;
          const wd = new Date(`${d}T00:00:00+08:00`)
            .toLocaleDateString("zh-TW", { weekday: "short", timeZone: "Asia/Taipei" });

          return (
            <div
              key={d}
              className={`rounded-xl border p-2 text-center ${
                isToday
                  ? "border-amber-400 bg-amber-50 shadow"
                  : "border-slate-100 bg-white/40"
              }`}
            >
              <div className="text-[10px] text-slate-500">{wd}</div>
              <div className={`text-xs font-bold ${isToday ? "text-amber-700" : "text-slate-700"}`}>
                {d.slice(5).replace("-", "/")}
              </div>
              {s ? (
                s.isOff ? (
                  <div className="mt-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-500">
                    休
                  </div>
                ) : (
                  <div className="mt-1 text-[10px] font-medium text-slate-900">
                    {s.startTime}<br />~{s.endTime}
                  </div>
                )
              ) : (
                <div className="mt-1 text-[10px] text-slate-300">—</div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
