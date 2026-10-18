"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { RowActions } from "./row-actions";
import { LeavesExpand } from "./leaves-expand";
import type { SubordinateRow as Row } from "./types";

export function SubordinateRow({
  row,
  isAdmin,
  batchMode,
  selected,
  onToggleSelected,
  onPatch,
}: {
  row: Row;
  isAdmin: boolean;
  batchMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
  onPatch: (patch: Partial<Row>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const tone = balanceTone(row.balance.remaining, row.balance.entitlement + row.balance.adjustments);

  return (
    <li
      className={
        "glass-subtle overflow-hidden rounded-2xl transition " +
        (row.active ? "" : "opacity-70 ") +
        (selected ? "ring-2 ring-ios-blue/40" : "")
      }
    >
      <div className="flex items-start gap-3 px-3 py-3 md:px-4 md:py-3.5">
        {batchMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            className="mt-1 h-4 w-4 flex-shrink-0 rounded"
            aria-label={`選取 ${row.name}`}
          />
        )}

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          aria-expanded={expanded}
          aria-label={`展開 ${row.name} 的詳細資訊`}
        >
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-slate-900">{row.name}</span>
              <span className="text-xs font-normal text-slate-500">{row.employeeNo}</span>
              {row.role !== "EMPLOYEE" && (
                <span className="rounded-full bg-ios-indigo/15 px-1.5 py-0.5 text-[10px] font-semibold text-ios-indigo">
                  {row.role === "MANAGER" ? "主管" : "HR"}
                </span>
              )}
              {!row.active && (
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                  已停用
                </span>
              )}
              {row.pendingCount > 0 && (
                <span className="rounded-full bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  {row.pendingCount} 筆待審
                </span>
              )}
              {row.thisMonthUsed > 0 && (
                <span className="rounded-full bg-ios-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-ios-blue">
                  本月 {row.thisMonthUsed} 天
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate text-xs text-slate-500">
              {row.department ?? "—"} · {row.jobTitle ?? "—"} · 到職 {format(new Date(row.hireDate), "yyyy-MM-dd")}
            </div>
          </div>

          {/* 餘額速覽：剩餘 / 配額 */}
          {row.balance.annualLeaveEnabled ? (
            <div className="hidden flex-shrink-0 text-right sm:block">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">剩餘</div>
              <div className={`text-xl font-bold tabular-nums ${tone.text}`}>
                {row.balance.remaining}
              </div>
              <div className="text-[10px] text-slate-400">
                / {row.balance.entitlement + row.balance.adjustments} 天
              </div>
            </div>
          ) : (
            <div className="hidden flex-shrink-0 text-right text-[10px] text-slate-400 sm:block">
              無特休
            </div>
          )}

          <span className="mt-1 flex-shrink-0 text-slate-400">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </button>

        <div className="flex-shrink-0">
          <RowActions row={row} isAdmin={isAdmin} onPatch={onPatch} />
        </div>
      </div>

      {/* 手機版才顯示的餘額列（小螢幕沒空間放在右邊）*/}
      {row.balance.annualLeaveEnabled && (
        <div className="flex items-center justify-between border-t border-white/30 bg-white/20 px-4 py-2 text-xs sm:hidden dark:border-slate-700/40 dark:bg-slate-800/20">
          <span className="text-slate-500">本年度特休</span>
          <span>
            剩餘 <strong className={tone.text}>{row.balance.remaining}</strong>
            <span className="text-slate-400"> / {row.balance.entitlement + row.balance.adjustments} 天</span>
          </span>
        </div>
      )}

      {expanded && (
        <div className="border-t border-white/30 bg-white/20 p-4 dark:border-slate-700/40 dark:bg-slate-800/20">
          <LeavesExpand userId={row.id} />
        </div>
      )}
    </li>
  );
}

function balanceTone(remaining: number, total: number) {
  if (total <= 0) return { text: "text-slate-500" };
  const ratio = remaining / total;
  if (ratio >= 0.6) return { text: "text-emerald-600 dark:text-emerald-400" };
  if (ratio >= 0.3) return { text: "text-ios-blue" };
  if (ratio > 0) return { text: "text-amber-600 dark:text-amber-400" };
  return { text: "text-slate-500" };
}
