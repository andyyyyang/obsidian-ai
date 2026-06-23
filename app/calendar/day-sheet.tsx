"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Cake, ChevronRight, PartyPopper, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { CalendarEvents, LeaveEvent } from "./types";

function leaveLabel(lv: LeaveEvent): string {
  if (lv.isHalfDay) return `半天 (${lv.halfDayPeriod === "AM" ? "上午" : "下午"})`;
  const s = lv.startDate;
  const e = lv.endDate;
  if (s.getTime() === e.getTime()) return "全天";
  return `${format(s, "MM-dd")} ~ ${format(e, "MM-dd")}`;
}

export function DaySheet({
  date,
  events,
  meId,
  onClose,
}: {
  date: Date;
  events: CalendarEvents;
  meId: string;
  onClose: () => void;
}) {
  const key = format(date, "yyyy-MM-dd");
  const dayLeaves = events.leaves.filter(
    (l) => format(l.startDate, "yyyy-MM-dd") <= key && format(l.endDate, "yyyy-MM-dd") >= key,
  );
  const dayBirthdays = events.birthdays.filter((b) => format(b.date, "yyyy-MM-dd") === key);
  const dayAnniversaries = events.anniversaries.filter((a) => format(a.date, "yyyy-MM-dd") === key);
  const isEmpty =
    dayLeaves.length === 0 && dayBirthdays.length === 0 && dayAnniversaries.length === 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
      <div
        className="glass-strong relative z-10 w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">{format(date, "yyyy")} 年</div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {format(date, "M 月 d 日")}
            </div>
            <div className="text-xs text-slate-500">
              {["週日", "週一", "週二", "週三", "週四", "週五", "週六"][date.getDay()]}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost h-9 w-9 !px-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isEmpty && (
          <p className="py-10 text-center text-sm text-slate-500">這天沒有任何事件 🌤️</p>
        )}

        {dayLeaves.length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              請假 ({dayLeaves.length})
            </h3>
            <ul className="space-y-2">
              {dayLeaves.map((lv) => (
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
                        {lv.status === "PENDING" && (
                          <span className="rounded-full bg-yellow-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
                            待審
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {leaveLabel(lv)}
                        {lv.department ? ` · ${lv.department}` : ""}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {dayBirthdays.length > 0 && (
          <section className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              生日 ({dayBirthdays.length})
            </h3>
            <ul className="space-y-2">
              {dayBirthdays.map((b) => (
                <li
                  key={b.userId}
                  className="glass-subtle flex items-center gap-3 rounded-2xl p-3"
                >
                  <Avatar name={b.name} size="md" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.department ?? "—"}</div>
                  </div>
                  <Cake className="h-5 w-5 text-rose-400" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {dayAnniversaries.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              到職週年 ({dayAnniversaries.length})
            </h3>
            <ul className="space-y-2">
              {dayAnniversaries.map((a) => (
                <li
                  key={a.userId}
                  className="glass-subtle flex items-center gap-3 rounded-2xl p-3"
                >
                  <Avatar name={a.name} size="md" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{a.name}</div>
                    <div className="text-xs text-slate-500">
                      {a.department ?? "—"} ·{" "}
                      <span className="text-gradient font-semibold">{a.years} 週年</span>
                    </div>
                  </div>
                  <PartyPopper className="h-5 w-5 text-violet-400" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
