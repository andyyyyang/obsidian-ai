"use client";

import Link from "next/link";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { Cake, PartyPopper } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { CalendarEvents, LeaveEvent } from "../types";

const dayLabels = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

export function WeekView({
  cursor,
  events,
  meId,
  onPickDay,
}: {
  cursor: Date;
  events: CalendarEvents;
  meId: string;
  onPickDay: (d: Date) => void;
}) {
  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const today = new Date();

  // 找出本週有請假的所有人，每人組裝其本週的請假段
  const peopleMap = new Map<string, { name: string; leaves: LeaveEvent[] }>();
  for (const lv of events.leaves) {
    if (lv.endDate < weekStart || lv.startDate > weekEnd) continue;
    const p = peopleMap.get(lv.requesterId) ?? { name: lv.name, leaves: [] };
    p.leaves.push(lv);
    peopleMap.set(lv.requesterId, p);
  }
  const people = Array.from(peopleMap.entries()).sort(([a], [b]) => {
    // 自己擺第一
    if (a === meId) return -1;
    if (b === meId) return 1;
    return 0;
  });

  // 各天生日 / 週年
  const birthdaysByDay = new Map<string, typeof events.birthdays>();
  const anniversariesByDay = new Map<string, typeof events.anniversaries>();
  for (const b of events.birthdays) {
    const k = format(b.date, "yyyy-MM-dd");
    const arr = birthdaysByDay.get(k) ?? [];
    arr.push(b);
    birthdaysByDay.set(k, arr);
  }
  for (const a of events.anniversaries) {
    const k = format(a.date, "yyyy-MM-dd");
    const arr = anniversariesByDay.get(k) ?? [];
    arr.push(a);
    anniversariesByDay.set(k, arr);
  }

  return (
    <>
      {/* Desktop: gantt-like */}
      <div className="glass-strong hidden overflow-hidden rounded-3xl md:block">
        {/* 標題列 */}
        <div className="grid grid-cols-[160px_repeat(7,1fr)] border-b border-white/40 dark:border-white/5">
          <div className="bg-white/30 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/5">
            員工
          </div>
          {days.map((d, i) => {
            const isToday = isSameDay(d, today);
            return (
              <button
                key={i}
                onClick={() => onPickDay(d)}
                className={`border-l border-white/30 px-2 py-2 text-xs transition-colors hover:bg-white/40 dark:border-white/5 dark:hover:bg-white/5 ${
                  isToday
                    ? "bg-amber-100/30 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                    : i >= 5
                      ? "text-rose-500/80"
                      : "text-slate-600"
                }`}
              >
                <div className="font-medium">{dayLabels[i]}</div>
                <div className="text-[10px] opacity-70">{format(d, "M/d")}</div>
              </button>
            );
          })}
        </div>

        {/* 生日 / 週年 列 */}
        {(events.birthdays.length > 0 || events.anniversaries.length > 0) && (
          <div className="grid grid-cols-[160px_repeat(7,1fr)] border-b border-white/40 dark:border-white/5">
            <div className="bg-white/20 px-3 py-1.5 text-[10px] text-slate-500 dark:bg-white/[0.03]">
              節日 / 紀念
            </div>
            {days.map((d, i) => {
              const k = format(d, "yyyy-MM-dd");
              const bs = birthdaysByDay.get(k) ?? [];
              const ans = anniversariesByDay.get(k) ?? [];
              return (
                <div
                  key={i}
                  className="border-l border-white/30 px-1.5 py-1 text-[10px] dark:border-white/5"
                >
                  {bs.map((b) => (
                    <div key={b.userId} className="flex items-center gap-0.5 text-rose-500">
                      <Cake className="h-2.5 w-2.5" />
                      <span className="truncate">{b.name}</span>
                    </div>
                  ))}
                  {ans.map((a) => (
                    <div key={a.userId} className="flex items-center gap-0.5 text-violet-500">
                      <PartyPopper className="h-2.5 w-2.5" />
                      <span className="truncate">
                        {a.name} <span className="opacity-70">{a.years}週</span>
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* 員工列 */}
        {people.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">本週無請假紀錄</div>
        ) : (
          people.map(([userId, p]) => (
            <div
              key={userId}
              className="grid min-h-[52px] grid-cols-[160px_repeat(7,1fr)] border-b border-white/30 dark:border-white/5"
            >
              <div className="flex items-center gap-2 bg-white/15 px-3 py-2 dark:bg-white/[0.02]">
                <Avatar name={p.name} size="sm" />
                <span
                  className={`truncate text-xs font-medium ${
                    userId === meId ? "text-amber-600 dark:text-amber-300" : "text-slate-800"
                  }`}
                >
                  {p.name}
                </span>
              </div>
              {/* 7 個格子當 bar 背景 */}
              <div className="col-span-7 relative grid grid-cols-7">
                {days.map((_, i) => (
                  <div key={i} className="border-l border-white/30 dark:border-white/5" />
                ))}
                {/* 請假橫條 */}
                {p.leaves.map((lv) => {
                  const lvStart = lv.startDate < weekStart ? weekStart : lv.startDate;
                  const lvEnd = lv.endDate > weekEnd ? weekEnd : lv.endDate;
                  const startIdx =
                    Math.floor((lvStart.getTime() - weekStart.getTime()) / 86400000) + 1;
                  const endIdx =
                    Math.floor((lvEnd.getTime() - weekStart.getTime()) / 86400000) + 2;
                  const mine = userId === meId;
                  return (
                    <Link
                      key={lv.id}
                      href={`/leave/${lv.id}`}
                      className={`absolute top-1.5 bottom-1.5 mx-0.5 flex items-center justify-center rounded-xl px-2 text-[10px] font-semibold transition-transform hover:scale-[1.02] ${
                        lv.status === "APPROVED"
                          ? "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100"
                          : "bg-yellow-200/80 text-yellow-900 dark:bg-yellow-500/30 dark:text-yellow-100"
                      } ${
                        mine
                          ? "ring-2 ring-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : ""
                      }`}
                      style={{
                        left: `${((startIdx - 1) / 7) * 100}%`,
                        width: `${((endIdx - startIdx) / 7) * 100}%`,
                      }}
                    >
                      {lv.isHalfDay
                        ? `半天 ${lv.halfDayPeriod === "AM" ? "AM" : "PM"}`
                        : lv.status === "PENDING"
                          ? "待審"
                          : "請假"}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile: 一日一段 */}
      <div className="space-y-3 md:hidden">
        {days.map((d) => {
          const k = format(d, "yyyy-MM-dd");
          const isToday = isSameDay(d, today);
          const dayLeaves = events.leaves.filter(
            (l) =>
              format(l.startDate, "yyyy-MM-dd") <= k && format(l.endDate, "yyyy-MM-dd") >= k,
          );
          const bs = birthdaysByDay.get(k) ?? [];
          const ans = anniversariesByDay.get(k) ?? [];
          const total = dayLeaves.length + bs.length + ans.length;
          return (
            <button
              key={k}
              onClick={() => onPickDay(d)}
              className={`glass-strong block w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.98] ${
                isToday ? "ring-2 ring-amber-400/70" : ""
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-bold text-slate-900">{format(d, "d")}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {dayLabels[(d.getDay() + 6) % 7]}
                  </span>
                </div>
                {isToday && (
                  <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/30 dark:text-amber-200">
                    今天
                  </span>
                )}
              </div>
              {total === 0 ? (
                <div className="text-xs text-slate-400">無事件</div>
              ) : (
                <div className="space-y-1.5">
                  {dayLeaves.slice(0, 3).map((lv) => (
                    <div
                      key={lv.id}
                      className={`flex items-center gap-2 text-xs ${
                        lv.requesterId === meId ? "font-semibold text-amber-600" : "text-slate-700"
                      }`}
                    >
                      <Avatar name={lv.name} size="sm" />
                      <span className="truncate">
                        {lv.name}{" "}
                        {lv.isHalfDay && (
                          <span className="text-slate-400">
                            (半天 {lv.halfDayPeriod === "AM" ? "AM" : "PM"})
                          </span>
                        )}
                        {lv.status === "PENDING" && (
                          <span className="ml-1 rounded-full bg-yellow-100/80 px-1.5 text-[9px] text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
                            待審
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {dayLeaves.length > 3 && (
                    <div className="text-[10px] text-slate-500">
                      +{dayLeaves.length - 3} 位請假
                    </div>
                  )}
                  {bs.map((b) => (
                    <div key={b.userId} className="flex items-center gap-1 text-xs text-rose-500">
                      <Cake className="h-3 w-3" /> {b.name} 生日
                    </div>
                  ))}
                  {ans.map((a) => (
                    <div
                      key={a.userId}
                      className="flex items-center gap-1 text-xs text-violet-500"
                    >
                      <PartyPopper className="h-3 w-3" /> {a.name} {a.years} 週年
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
