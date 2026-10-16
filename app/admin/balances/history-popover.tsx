"use client";

import { format } from "date-fns";
import { History, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { BalanceRow } from "./balances-client";

export function HistoryPopover({
  row,
  onClose,
}: {
  row: BalanceRow;
  onClose: () => void;
}) {
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
          <div className="flex items-center gap-3">
            <Avatar name={row.name} size="md" />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {row.name} 的本年度調整歷史
              </div>
              <div className="text-xs text-slate-500">
                共 {row.adjustmentHistory.length} 筆
                {row.balance.year && (
                  <>
                    {" "}
                    · 週期 {row.balance.year.start.slice(0, 10)} ~{" "}
                    {row.balance.year.end.slice(0, 10)}
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/50 p-1.5 hover:bg-white/80">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex items-baseline justify-between rounded-2xl bg-white/40 px-4 py-2">
          <span className="text-xs text-slate-500">本年度淨調整</span>
          <span
            className={`text-xl font-bold ${
              row.balance.adjustments > 0
                ? "text-emerald-600"
                : row.balance.adjustments < 0
                  ? "text-rose-600"
                  : "text-slate-700"
            }`}
          >
            {row.balance.adjustments > 0 ? "+" : ""}
            {row.balance.adjustments} 天
          </span>
        </div>

        {row.adjustmentHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">本年度沒有調整紀錄</p>
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
            {row.adjustmentHistory.map((a) => (
              <li
                key={a.id}
                className="glass-subtle flex items-start justify-between gap-3 rounded-2xl p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-900">{a.reason}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    <History className="mr-1 inline h-2.5 w-2.5" />
                    {format(new Date(a.createdAt), "yyyy-MM-dd HH:mm")}
                    {a.createdByName !== "—" && ` · 經手 ${a.createdByName}`}
                  </div>
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-bold ${
                    a.days > 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                  }`}
                >
                  {a.days > 0 ? "+" : ""}
                  {a.days}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
