"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMonths, addWeeks, format, startOfMonth, subMonths, subWeeks } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Rss, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/components/icons/glass-icons";
import { MonthView } from "./views/month-view";
import { WeekView } from "./views/week-view";
import { DayView } from "./views/day-view";
import { DaySheet } from "./day-sheet";
import { PeoplePicker, type Person } from "./people-picker";
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
  people,
  initialFocus,
}: {
  initial: Initial;
  meId: string;
  initialMonth: string; // yyyy-MM
  icalToken: string;
  origin: string;
  people: Person[];
  initialFocus: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<CalendarMode>("month");
  const [cursor, setCursor] = useState<Date>(() => new Date(`${initialMonth}-01T00:00:00`));
  const [events, setEvents] = useState<CalendarEvents>(() => deserialize(initial));
  const [loadedRange, setLoadedRange] = useState<{ from: Date; to: Date }>(() => ({
    from: subMonths(startOfMonth(cursor), 1),
    to: addMonths(startOfMonth(cursor), 2),
  }));
  const [sheetDate, setSheetDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<string[]>(initialFocus);
  const firstFocusSync = useRef(true);

  // 把 focus 同步到 URL — 分享連結 / 重整 / 回頁都能保留
  useEffect(() => {
    if (firstFocusSync.current) {
      firstFocusSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (focus.length > 0) params.set("focus", focus.join(","));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [focus, router, pathname]);

  // 過濾後的事件：空 focus 顯示全部；有 focus 只顯示那些人的 leave
  // 生日 / 週年永遠保留（提醒資訊，跟請假是否相關都值得看到）
  const filteredEvents = useMemo<CalendarEvents>(() => {
    if (focus.length === 0) return events;
    const set = new Set(focus);
    return {
      ...events,
      leaves: events.leaves.filter((l) => set.has(l.requesterId)),
    };
  }, [events, focus]);

  const focusedPeople = useMemo(
    () => people.filter((p) => focus.includes(p.id)),
    [people, focus],
  );

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftCursor(-1)}
            icon={<ChevronLeft className="h-4 w-4" />}
            aria-label="上一個"
          />
          <h2 className="min-w-[10rem] px-2 text-center text-sm font-semibold text-slate-900">
            {titleLabel}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftCursor(1)}
            icon={<ChevronRight className="h-4 w-4" />}
            aria-label="下一個"
          />
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

        {/* 右：今天 / 選員工 / 訂閱 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setCursor(new Date())}
            icon={<CalendarIcon className="h-3.5 w-3.5" />}
          >
            今天
          </Button>
          {people.length > 1 && (
            <PeoplePicker people={people} meId={meId} focus={focus} onChange={setFocus} />
          )}
          <Button
            variant="ghost"
            size="xs"
            onClick={copyIcal}
            title="複製 iCal 訂閱網址"
            icon={<Rss className="h-3.5 w-3.5" />}
          >
            <span className="hidden sm:inline">訂閱</span>
          </Button>
        </div>
      </div>

      {/* Focus 狀態列：有 focus 時顯示誰正在被 overlay */}
      {focus.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-ios-blue/10 px-3 py-2 text-xs text-ios-blue">
          <span className="font-semibold">正在檢視：</span>
          {focusedPeople.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
            >
              {p.id === meId ? "我" : p.name}
              <button
                type="button"
                onClick={() => setFocus(focus.filter((id) => id !== p.id))}
                className="rounded-full p-0.5 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                aria-label={`取消 ${p.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setFocus([])}
            className="ml-auto text-[11px] text-slate-500 hover:underline"
          >
            清除全部
          </button>
        </div>
      )}

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
        <MonthView cursor={cursor} events={filteredEvents} meId={meId} onPickDay={setSheetDate} />
      )}
      {mode === "week" && (
        <WeekView cursor={cursor} events={filteredEvents} meId={meId} onPickDay={setSheetDate} />
      )}
      {mode === "day" && (
        <DayView cursor={cursor} events={filteredEvents} meId={meId} onCursorChange={setCursor} />
      )}

      {/* 抽屜 */}
      {sheetDate && (
        <DaySheet
          date={sheetDate}
          events={filteredEvents}
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
