"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, addWeeks, format, startOfMonth, subMonths, subWeeks } from "date-fns";
import { Calendar as CalendarIcon, CalendarDays, ChevronLeft, ChevronRight, Rss } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { MonthView } from "./views/month-view";
import { WeekView } from "./views/week-view";
import { DayView } from "./views/day-view";
import { DaySheet } from "./day-sheet";
import type { CalendarEvents, CalendarMode } from "./types";

type Initial = {
  // ISO strings
  leaves: {
    id: string;
    requesterId: string;
    name: string;
    department: string | null;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    halfDayPeriod: "AM" | "PM" | null;
    status: "APPROVED" | "PENDING";
  }[];
  birthdays: { userId: string; name: string; department: string | null; date: string }[];
  anniversaries: {
    userId: string;
    name: string;
    department: string | null;
    date: string;
    years: number;
  }[];
};

function deserialize(d: Initial): CalendarEvents {
  return {
    leaves: d.leaves.map((l) => ({
      ...l,
      startDate: new Date(l.startDate),
      endDate: new Date(l.endDate),
    })),
    birthdays: d.birthdays.map((b) => ({ ...b, date: new Date(b.date) })),
    anniversaries: d.anniversaries.map((a) => ({ ...a, date: new Date(a.date) })),
  };
}

export function CalendarClient({
  initial,
  meId,
  initialMonth,
  icalToken,
  origin,
}: {
  initial: Initial;
  meId: string;
  initialMonth: string; // yyyy-MM
  icalToken: string;
  origin: string;
}) {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [cursor, setCursor] = useState<Date>(() => new Date(`${initialMonth}-01T00:00:00`));
  const [events, setEvents] = useState<CalendarEvents>(() => deserialize(initial));
  const [loadedRange, setLoadedRange] = useState<{ from: Date; to: Date }>(() => ({
    from: subMonths(startOfMonth(cursor), 1),
    to: addMonths(startOfMonth(cursor), 2),
  }));
  const [sheetDate, setSheetDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // 確保 cursor 在已載入範圍內，否則 fetch
  const ensureLoaded = useCallback(
    async (c: Date) => {
      const from = subMonths(startOfMonth(c), 1);
      const to = addMonths(startOfMonth(c), 2);
      if (from >= loadedRange.from && to <= loadedRange.to) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
        });
        const res = await fetch(`/api/calendar?${params}`);
        if (!res.ok) {
          toast.error("讀取行事曆失敗");
          return;
        }
        const data = (await res.json()) as Initial;
        setEvents(deserialize(data));
        setLoadedRange({ from, to });
      } finally {
        setLoading(false);
      }
    },
    [loadedRange],
  );

  useEffect(() => {
    ensureLoaded(cursor);
  }, [cursor, ensureLoaded]);

  function shiftCursor(delta: number) {
    if (mode === "week") setCursor((c) => (delta > 0 ? addWeeks(c, 1) : subWeeks(c, 1)));
    else if (mode === "day") setCursor((c) => new Date(c.getTime() + delta * 86400000));
    else setCursor((c) => (delta > 0 ? addMonths(c, 1) : subMonths(c, 1)));
  }

  const titleLabel = useMemo(() => {
    if (mode === "month") return format(cursor, "yyyy 年 M 月");
    if (mode === "week") return `${format(cursor, "yyyy 年 M 月")}（第 ${Math.ceil(cursor.getDate() / 7)} 週）`;
    return format(cursor, "yyyy 年 M 月 d 日");
  }, [mode, cursor]);

  async function copyIcal() {
    const url = `${origin}/api/calendar/ical/${icalToken}.ics`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("已複製訂閱網址，請貼到 Calendar app 訂閱行事曆");
    } catch {
      toast.error("複製失敗，請手動複製");
    }
  }

  return (
    <>
      {/* 工具列 */}
      <div className="glass-strong mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-3">
        {/* 左：上下切換 */}
        <div className="flex items-center gap-1">
          <button onClick={() => shiftCursor(-1)} className="btn-ghost h-9 w-9 !px-0">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="min-w-[10rem] px-2 text-center text-sm font-semibold text-slate-900">
            {titleLabel}
          </h2>
          <button onClick={() => shiftCursor(1)} className="btn-ghost h-9 w-9 !px-0">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 中：模式切換 */}
        <div className="glass-subtle flex items-center gap-0.5 rounded-2xl p-0.5 text-xs">
          {(["month", "week", "day"] as CalendarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl px-3 py-1.5 transition-colors ${
                mode === m
                  ? "bg-white/80 font-semibold text-slate-900 shadow-sm dark:bg-slate-900/60 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              {m === "month" ? "月" : m === "week" ? "週" : "日"}
            </button>
          ))}
        </div>

        {/* 右：今天 / 訂閱 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date())}
            className="btn-ghost text-xs"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            今天
          </button>
          <button onClick={copyIcal} className="btn-ghost text-xs" title="複製 iCal 訂閱網址">
            <Rss className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">訂閱</span>
          </button>
        </div>
      </div>

      {/* 圖例 */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
        <Legend color="bg-emerald-300 dark:bg-emerald-500/50">已核准</Legend>
        <Legend color="bg-yellow-300 dark:bg-yellow-500/50">申請中</Legend>
        <Legend color="bg-amber-400 ring-2 ring-amber-300 dark:ring-amber-500/40">我的請假</Legend>
        <Legend color="bg-rose-400">🎂 生日</Legend>
        <Legend color="bg-violet-400">🎉 週年</Legend>
        {loading && <span className="ml-auto animate-pulse text-slate-400">載入中…</span>}
      </div>

      {/* 視圖 */}
      {mode === "month" && (
        <MonthView cursor={cursor} events={events} meId={meId} onPickDay={setSheetDate} />
      )}
      {mode === "week" && (
        <WeekView cursor={cursor} events={events} meId={meId} onPickDay={setSheetDate} />
      )}
      {mode === "day" && (
        <DayView cursor={cursor} events={events} meId={meId} onCursorChange={setCursor} />
      )}

      {/* 抽屜 */}
      {sheetDate && (
        <DaySheet
          date={sheetDate}
          events={events}
          meId={meId}
          onClose={() => setSheetDate(null)}
        />
      )}

      <p className="mt-6 text-center text-xs text-slate-500">
        想把行事曆同步到手機？
        <button onClick={copyIcal} className="ml-1 inline-flex items-center gap-1 text-ios-blue hover:underline">
          <CalendarDays className="h-3 w-3" />
          複製訂閱網址
        </button>
        ，或前往
        <Link href="/profile" className="ml-1 text-ios-blue hover:underline">
          個人手冊
        </Link>
        查看完整訂閱說明。
      </p>
    </>
  );
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {children}
    </span>
  );
}
