"use client";

import type { DailySummary, DayStatus } from "@/lib/attendance";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const STATUS_LABEL: Record<DayStatus, { label: string; color: string }> = {
  ON_TIME:     { label: "正常",   color: "bg-emerald-100 text-emerald-700" },
  LATE:        { label: "遲到",   color: "bg-rose-100 text-rose-700" },
  EARLY_LEAVE: { label: "早退",   color: "bg-amber-100 text-amber-700" },
  INCOMPLETE:  { label: "漏打卡", color: "bg-orange-100 text-orange-700" },
  ABSENT:      { label: "缺勤",   color: "bg-rose-200 text-rose-800" },
  LEAVE:       { label: "請假",   color: "bg-sky-100 text-sky-700" },
  HALF_LEAVE:  { label: "半休",   color: "bg-sky-100 text-sky-700" },
  OFF:         { label: "休假",   color: "bg-slate-100 text-slate-500" },
  FUTURE:      { label: "—",      color: "bg-transparent text-slate-300" },
};

const fmt = (d?: Date) =>
  d
    ? new Date(d).toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Taipei",
      })
    : "—";

export function AttendanceTable({ summaries }: { summaries: DailySummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="pb-3 pr-4">日期</th>
            <th className="pb-3 pr-4">上班</th>
            <th className="pb-3 pr-4">下班</th>
            <th className="pb-3 pr-4 text-right">工時</th>
            <th className="pb-3 pr-4 text-right">遲到</th>
            <th className="pb-3 pr-4 text-right">早退</th>
            <th className="pb-3 pr-4 text-right">加班</th>
            <th className="pb-3 text-right">狀態</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60">
          {summaries.map((s) => {
            const meta = STATUS_LABEL[s.status];
            return (
              <tr key={s.date} className={s.status === "FUTURE" ? "opacity-50" : ""}>
                <td className="py-2.5 pr-4 tabular-nums text-slate-700">
                  {s.date.slice(5)} <span className="text-slate-400">({WEEKDAYS[s.weekday]})</span>
                </td>
                <td className="py-2.5 pr-4 tabular-nums">{fmt(s.clockIn)}</td>
                <td className="py-2.5 pr-4 tabular-nums">{fmt(s.clockOut)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {s.workMinutes ? (s.workMinutes / 60).toFixed(1) + "h" : "—"}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {s.lateMinutes ? <span className="text-rose-600">{s.lateMinutes} 分</span> : "—"}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {s.earlyLeaveMinutes ? <span className="text-amber-600">{s.earlyLeaveMinutes} 分</span> : "—"}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {s.overtimeMinutes ? `${s.overtimeMinutes} 分` : "—"}
                </td>
                <td className="py-2.5 text-right">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                    {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
