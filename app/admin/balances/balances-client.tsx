"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronDown, History, Pencil, Search, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { AdjustForm } from "./adjust-form";
import { EditHireDate } from "./edit-hire-date";
import { HistoryPopover } from "./history-popover";

export type BalanceRow = {
  id: string;
  employeeNo: string;
  name: string;
  department: string | null;
  hireDate: string;
  balance: {
    year: { start: string; end: string } | null;
    entitlement: number;
    adjustments: number;
    used: number;
    pending: number;
    remaining: number;
    annualLeaveEnabled: boolean;
  };
  adjustmentHistory: {
    id: string;
    days: number;
    reason: string;
    createdAt: string;
    createdByName: string;
  }[];
};

type SortKey = "employeeNo" | "name" | "remaining" | "hireDate";
type SortDir = "asc" | "desc";

export function BalancesClient({
  rows,
  departments,
}: {
  rows: BalanceRow[];
  departments: string[];
}) {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("employeeNo");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = rows.filter((r) => {
      if (deptFilter && r.department !== deptFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.employeeNo.toLowerCase().includes(q) ||
        (r.department ?? "").toLowerCase().includes(q)
      );
    });
    const sign = sortDir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      if (sortKey === "employeeNo") return a.employeeNo.localeCompare(b.employeeNo) * sign;
      if (sortKey === "name") return a.name.localeCompare(b.name) * sign;
      if (sortKey === "hireDate") return a.hireDate.localeCompare(b.hireDate) * sign;
      if (sortKey === "remaining") return (a.balance.remaining - b.balance.remaining) * sign;
      return 0;
    });
    return result;
  }, [rows, query, deptFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <>
      {/* 搜尋 + 篩選列 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/40 bg-white/40 px-4 py-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋姓名、員編、部門"
            className="input !py-1.5 !pl-8 text-xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="input !w-auto !py-1.5 text-xs"
        >
          <option value="">全部部門</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-500">
          顯示 {filtered.length} / {rows.length} 人
        </span>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/40 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <SortableTh active={sortKey === "employeeNo"} dir={sortDir} onClick={() => toggleSort("employeeNo")}>員編</SortableTh>
              <SortableTh active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>姓名</SortableTh>
              <SortableTh active={sortKey === "hireDate"} dir={sortDir} onClick={() => toggleSort("hireDate")}>到職日</SortableTh>
              <Th>本年度週期</Th>
              <Th align="right">法定</Th>
              <Th align="right">調整</Th>
              <Th align="right">已用</Th>
              <Th align="right">申請中</Th>
              <SortableTh active={sortKey === "remaining"} dir={sortDir} onClick={() => toggleSort("remaining")} align="right">剩餘</SortableTh>
              <Th>動作</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-sm text-slate-500">
                  沒有符合條件的員工
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const yearStart = u.balance.year ? new Date(u.balance.year.start) : null;
              const yearEnd = u.balance.year ? new Date(u.balance.year.end) : null;
              const totalAvail = u.balance.entitlement + u.balance.adjustments;
              const usagePct = totalAvail > 0 ? (u.balance.remaining / totalAvail) * 100 : 0;
              const remainingClass =
                !u.balance.annualLeaveEnabled
                  ? "text-slate-400"
                  : usagePct >= 70
                    ? "text-emerald-600 dark:text-emerald-400"
                    : usagePct >= 30
                      ? "text-amber-600 dark:text-amber-400"
                      : usagePct > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-400";

              return (
                <tr key={u.id} className="transition-colors hover:bg-white/40">
                  <Td>{u.employeeNo}</Td>
                  <Td className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <Avatar name={u.name} size="sm" />
                      <span>{u.name}</span>
                      {u.department && (
                        <span className="text-xs font-normal text-slate-400">· {u.department}</span>
                      )}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-slate-600">
                    {format(new Date(u.hireDate), "yyyy-MM-dd")}
                  </Td>
                  <Td>
                    {yearStart && yearEnd ? (
                      <EditHireDate
                        userId={u.id}
                        userName={u.name}
                        currentHireDate={u.hireDate.slice(0, 10)}
                        cycleStart={format(yearStart, "yyyy-MM-dd")}
                        cycleEnd={format(yearEnd, "yyyy-MM-dd")}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </Td>
                  <Td align="right">{u.balance.entitlement}</Td>
                  <Td align="right">
                    {u.adjustmentHistory.length > 0 ? (
                      <button
                        onClick={() =>
                          setHistoryOpen(historyOpen === u.id ? null : u.id)
                        }
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs transition-colors ${
                          u.balance.adjustments > 0
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : u.balance.adjustments < 0
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                        }`}
                        title={`${u.adjustmentHistory.length} 筆調整，點看歷史`}
                      >
                        {u.balance.adjustments > 0 ? "+" : ""}
                        {u.balance.adjustments}
                        <History className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </Td>
                  <Td align="right">{u.balance.used}</Td>
                  <Td align="right">{u.balance.pending}</Td>
                  <Td align="right" className={`font-bold ${remainingClass}`}>
                    {u.balance.remaining}
                  </Td>
                  <Td>
                    {u.balance.year && <AdjustForm userId={u.id} userName={u.name} />}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 歷史 popover (floating overlay) */}
      {historyOpen && (
        <HistoryPopover
          row={filtered.find((r) => r.id === historyOpen)!}
          onClose={() => setHistoryOpen(null)}
        />
      )}
    </>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function SortableTh({
  children,
  active,
  dir,
  onClick,
  align,
}: {
  children: React.ReactNode;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "right";
}) {
  return (
    <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-0.5 uppercase tracking-wide hover:text-slate-900 ${
          active ? "text-ios-blue" : ""
        }`}
      >
        {children}
        {active && (
          <ChevronDown
            className={`h-3 w-3 transition-transform ${dir === "desc" ? "" : "rotate-180"}`}
          />
        )}
      </button>
    </th>
  );
}

function Td({
  children,
  align,
  className,
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <td className={`px-4 py-3.5 ${align === "right" ? "text-right tabular-nums" : ""} ${className ?? ""}`}>
      {children}
    </td>
  );
}
