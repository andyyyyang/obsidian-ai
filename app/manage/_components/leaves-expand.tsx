"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { SubordinateLeave } from "./types";

export function LeavesExpand({ userId }: { userId: string }) {
  const [leaves, setLeaves] = useState<SubordinateLeave[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/manager/subordinates/${userId}/leaves?take=15`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "載入失敗");
          return;
        }
        setLeaves(data.leaves ?? []);
      } catch {
        if (!cancelled) setError("網路錯誤");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) {
    return <p className="text-xs text-rose-500">{error}</p>;
  }

  if (!leaves) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        載入請假紀錄…
      </div>
    );
  }

  if (leaves.length === 0) {
    return <p className="text-xs text-slate-500">尚無請假紀錄。</p>;
  }

  return (
    <div className="space-y-1.5">
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500">
        <span>最近 {leaves.length} 筆請假</span>
      </div>
      <ul className="divide-y divide-white/40 overflow-hidden rounded-xl bg-white/40 dark:divide-slate-700/40 dark:bg-slate-800/30">
        {leaves.map((l) => {
          const range =
            l.startDate.slice(0, 10) === l.endDate.slice(0, 10)
              ? format(new Date(l.startDate), "yyyy-MM-dd")
              : `${format(new Date(l.startDate), "yyyy-MM-dd")} ~ ${format(new Date(l.endDate), "yyyy-MM-dd")}`;
          return (
            <li key={l.id} className="flex items-center gap-3 px-3 py-2 text-xs">
              <StatusBadge status={l.status} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-slate-800 dark:text-slate-200">
                  {range}
                  <span className="ml-2 text-slate-500">{l.days} 天</span>
                  {l.isHalfDay && (
                    <span className="ml-1 text-[10px] text-slate-400">
                      · 半天 {l.halfDayPeriod === "AM" ? "上午" : "下午"}
                    </span>
                  )}
                </div>
                {l.reason && (
                  <div className="truncate text-[11px] text-slate-500">{l.reason}</div>
                )}
              </div>
              <Link
                href={`/leave/${l.id}`}
                className="flex-shrink-0 rounded-full p-1 text-slate-400 hover:bg-white/60 hover:text-ios-blue dark:hover:bg-slate-700/50"
                aria-label="開啟申請詳情"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
