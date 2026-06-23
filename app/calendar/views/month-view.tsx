"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Cake, PartyPopper } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { CalendarEvents } from "../types";

export function MonthView({
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
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const today = new Date();

  // 預組各天的事件
  const byDay = new Map<
    string,
    {
      leaves: { id: string; requesterId: string; name: string; status: string; isHalfDay: boolean }[];
      birthdays: string[];
      anniversaries: string[];
    }
  >();
  for (const d of days) {
    byDay.set(format(d, "yyyy-MM-dd"), { leaves: [], birthdays: [], anniversaries: [] });
  }
  for (const lv of events.leaves) {
    eachDayOfInterval({ start: lv.startDate, end: lv.endDate }).forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      const slot = byDay.get(key);
      if (slot)
        slot.leaves.push({
          id: lv.id,
          requesterId: lv.requesterId,
          name: lv.name,
          status: lv.status,
          isHalfDay: lv.isHalfDay,
        });
    });
  }
  for (const b of events.birthdays) {
    const key = format(b.date, "yyyy-MM-dd");
    byDay.get(key)?.birthdays.push(b.name);
  }
  for (const a of events.anniversaries) {
    const key = format(a.date, "yyyy-MM-dd");
    byDay.get(key)?.anniversaries.push(`${a.name} ${a.years}週`);
  }

  return (
    <div className="glass-strong overflow-hidden rounded-3xl">
      <div className="grid grid-cols-7 border-b border-white/40 bg-white/30 text-xs dark:border-white/5 dark:bg-white/5">
        {["一", "二", "三", "四", "五", "六", "日"].map((d, i) => (
          <div
            key={d}
            className={`px-2 py-2 text-center font-medium ${
              i >= 5 ? "text-rose-500/80" : "text-slate-600"
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, idx) => {
          const key = format(d, "yyyy-MM-dd");
          const slot = byDay.get(key)!;
          const inMonth = isSameMonth(d, cursor);
          const isToday = isSameDay(d, today);
          const isWeekend = idx % 7 >= 5;
          const totalItems =
            slot.leaves.length + slot.birthdays.length + slot.anniversaries.length;
          const hasMine = slot.leaves.some((l) => l.requesterId === meId);

          // 取前 3 個 avatar
          const avatars = slot.leaves.slice(0, 3);
          const overflow = totalItems - avatars.length - (slot.birthdays.length > 0 ? 1 : 0) -
            (slot.anniversaries.length > 0 ? 1 : 0);

          return (
            <button
              key={key}
              onClick={() => onPickDay(d)}
              className={`group relative min-h-[88px] border-b border-r border-white/30 p-1.5 text-left text-xs transition-colors dark:border-white/5 ${
                inMonth ? "" : "opacity-40"
              } ${isWeekend ? "bg-white/15 dark:bg-white/[0.02]" : ""} ${
                isToday
                  ? "bg-amber-100/30 ring-2 ring-amber-400/70 ring-inset dark:bg-amber-500/10"
                  : "hover:bg-white/40 dark:hover:bg-white/5"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`text-[11px] font-medium ${
                    isToday ? "text-amber-700 dark:text-amber-300" : "text-slate-700"
                  }`}
                >
                  {format(d, "d")}
                </span>
                {hasMine && (
                  <span
                    title="你的請假"
                    className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                  />
                )}
              </div>

              {/* 請假 avatars */}
              {avatars.length > 0 && (
                <div className="flex -space-x-1.5">
                  {avatars.map((lv, i) => (
                    <span
                      key={`${lv.id}-${i}`}
                      className={`relative inline-block ${
                        lv.requesterId === meId
                          ? "rounded-full ring-2 ring-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                          : ""
                      }`}
                    >
                      <Avatar name={lv.name} size="sm" />
                      {lv.status === "PENDING" && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-yellow-400 ring-2 ring-white dark:ring-slate-900" />
                      )}
                      {lv.isHalfDay && (
                        <span className="absolute -top-0.5 -right-0.5 rounded-full bg-slate-900 px-1 text-[7px] font-bold text-white">
                          ½
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* 生日 / 週年 */}
              <div className="mt-1 space-y-0.5">
                {slot.birthdays.length > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-rose-500">
                    <Cake className="h-3 w-3" />
                    <span className="truncate">{slot.birthdays[0]}</span>
                    {slot.birthdays.length > 1 && <span>+{slot.birthdays.length - 1}</span>}
                  </div>
                )}
                {slot.anniversaries.length > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-violet-500">
                    <PartyPopper className="h-3 w-3" />
                    <span className="truncate">{slot.anniversaries[0]}</span>
                    {slot.anniversaries.length > 1 && (
                      <span>+{slot.anniversaries.length - 1}</span>
                    )}
                  </div>
                )}
              </div>

              {overflow > 0 && (
                <div className="mt-0.5 text-[10px] text-slate-500">+{overflow} 更多</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
