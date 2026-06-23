"use client";

import Link from "next/link";
import { addDays, format, isSameDay, subDays } from "date-fns";
import { Cake, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { CalendarEvents, LeaveEvent } from "../types";

function leaveLabel(lv: LeaveEvent): string {
  if (lv.isHalfDay) return `半天 (${lv.halfDayPeriod === "AM" ? "上午" : "下午"})`;
  const s = lv.startDate;
  const e = lv.endDate;
  if (s.getTime() === e.getTime()) return "全天";
  return `${format(s, "MM-dd")} ~ ${format(e, "MM-dd")}（全天）`;
}

export function DayView({
  cursor,
  events,
  meId,
  onCursorChange,
}: {
  cursor: Date;
  events: CalendarEvents;
  meId: string;
  onCursorChange: (d: Date) => void;
}) {
  const key = format(cursor, "yyyy-MM-dd");
  const today = new Date();
  const isToday = isSameDay(cursor, today);

  const leaves = events.leaves.filter(
    (l) => format(l.startDate, "yyyy-MM-dd") <= key && format(l.endDate, "yyyy-MM-dd") >= key,
  );
  const birthdays = events.birthdays.filter((b) => isSameDay(b.date, cursor));
  const anniversaries = events.anniversaries.filter((a) => isSameDay(a.date, cursor));
  const isEmpty = leaves.length === 0 && birthdays.length === 0 && anniversaries.length === 0;

  return (
    <div className="space-y-4">
      <div className="glass-strong flex items-center justify-between rounded-3xl p-4">
        <button onClick={() => onCursorChange(subDays(cursor, 1))} className="btn-ghost h-9 w-9 !px-0">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-500">{format(cursor, "yyyy 年")}</div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {format(cursor, "M 月 d 日")}
          </div>
          <div className="text-xs text-slate-500">
            {["週日", "週一", "週二", "週三", "週四", "週五", "週六"][cursor.getDay()]}
            {isToday && (
              <span className="ml-2 rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/30 dark:text-amber-200">
                今天
              </span>
            )}
          </div>
        </div>
        <button onClick={() => onCursorChange(addDays(cursor, 1))} className="btn-ghost h-9 w-9 !px-0">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {!isToday && (
        <button onClick={() => onCursorChange(today)} className="btn-ghost mx-auto block text-xs">
          回到今天
        </button>
      )}

      {isEmpty && (
        <div className="glass-strong rounded-3xl p-10 text-center text-sm text-slate-500">
          這天沒有任何事件 🌤️
        </div>
      )}

      {leaves.length > 0 && (
        <section className="glass-strong rounded-3xl p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            請假 <span className="text-slate-400">({leaves.length})</span>
          </h3>
          <ul className="space-y-2">
            {leaves.map((lv) => (
              <li key={lv.id}>
                <Link
                  href={`/leave/${lv.id}`}
                  className={`glass-subtle glass-hoverable flex items-center gap-3 rounded-2xl p-3 ${
                    lv.requesterId === meId
                      ? "ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                      : ""
                  }`}
                >
                  <Avatar name={lv.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      {lv.name}
                      {lv.requesterId === meId && (
                        <span className="rounded-full bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                          我
                        </span>
                      )}
                      {lv.status === "PENDING" ? (
                        <span className="rounded-full bg-yellow-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
                          待審
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                          已核准
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {leaveLabel(lv)}
                      {lv.department ? ` · ${lv.department}` : ""}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {birthdays.length > 0 && (
        <section className="glass-strong rounded-3xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Cake className="h-4 w-4 text-rose-500" />
            生日 <span className="text-slate-400">({birthdays.length})</span>
          </h3>
          <ul className="space-y-2">
            {birthdays.map((b) => (
              <li
                key={b.userId}
                className="glass-subtle flex items-center gap-3 rounded-2xl p-3"
              >
                <Avatar name={b.name} size="md" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{b.name}</div>
                  <div className="text-xs text-slate-500">{b.department ?? "—"}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {anniversaries.length > 0 && (
        <section className="glass-strong rounded-3xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <PartyPopper className="h-4 w-4 text-violet-500" />
            到職週年 <span className="text-slate-400">({anniversaries.length})</span>
          </h3>
          <ul className="space-y-2">
            {anniversaries.map((a) => (
              <li
                key={a.userId}
                className="glass-subtle flex items-center gap-3 rounded-2xl p-3"
              >
                <Avatar name={a.name} size="md" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{a.name}</div>
                  <div className="text-xs text-slate-500">
                    {a.department ?? "—"} ·{" "}
                    <span className="text-gradient font-semibold">{a.years} 週年</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
