"use client";

import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, Download, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersIcon, DownloadIcon } from "@/components/icons/glass-icons";
import { SubordinateRow } from "./subordinate-row";
import type { SubordinateRow as Row } from "./types";

type SortKey = "employeeNo" | "hireDate" | "remaining" | "monthUsed" | "pending";
type ActiveFilter = "all" | "active" | "inactive";

export function SubordinatesList({
  initialRows,
  isAdmin,
}: {
  initialRows: Row[];
  isAdmin: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [employmentFilter, setEmploymentFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("employeeNo");
  const [sortAsc, setSortAsc] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const depts = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.department && s.add(r.department));
    return Array.from(s).sort();
  }, [rows]);

  const employments = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add(r.employmentType));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (activeFilter !== "all") {
      out = out.filter((r) => (activeFilter === "active" ? r.active : !r.active));
    }
    if (deptFilter !== "all") {
      out = out.filter((r) => (r.department ?? "") === deptFilter);
    }
    if (employmentFilter !== "all") {
      out = out.filter((r) => r.employmentType === employmentFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.employeeNo.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.department ?? "").toLowerCase().includes(q) ||
          (r.jobTitle ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...out].sort((a, b) => {
      let v = 0;
      switch (sortKey) {
        case "employeeNo":
          v = a.employeeNo.localeCompare(b.employeeNo);
          break;
        case "hireDate":
          v = a.hireDate.localeCompare(b.hireDate);
          break;
        case "remaining":
          v = a.balance.remaining - b.balance.remaining;
          break;
        case "monthUsed":
          v = a.thisMonthUsed - b.thisMonthUsed;
          break;
        case "pending":
          v = a.pendingCount - b.pendingCount;
          break;
      }
      return sortAsc ? v : -v;
    });
    return sorted;
  }, [rows, query, activeFilter, deptFilter, employmentFilter, sortKey, sortAsc]);

  const totals = useMemo(() => {
    const sel = filtered.filter((r) => selected.has(r.id));
    return {
      visible: filtered.length,
      selected: sel.length,
      remaining: filtered.reduce((s, r) => s + r.balance.remaining, 0),
      pending: filtered.reduce((s, r) => s + r.pendingCount, 0),
    };
  }, [filtered, selected]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function exportCsv() {
    const target = batchMode && selected.size > 0 ? filtered.filter((r) => selected.has(r.id)) : filtered;
    const header = [
      "員編",
      "姓名",
      "Email",
      "角色",
      "部門",
      "職稱",
      "雇用類型",
      "到職日",
      "狀態",
      "本年度配額",
      "調整",
      "已核准",
      "申請中",
      "剩餘",
      "本月請假",
      "待審件數",
    ];
    const rolesLabel: Record<string, string> = { EMPLOYEE: "員工", MANAGER: "主管", ADMIN: "HR" };
    const empLabel: Record<string, string> = {
      FULL_TIME: "正職",
      PART_TIME: "兼職",
      CONTRACT: "約聘",
      INTERN: "實習",
    };
    const body = target.map((r) => [
      r.employeeNo,
      r.name,
      r.email,
      rolesLabel[r.role] ?? r.role,
      r.department ?? "",
      r.jobTitle ?? "",
      empLabel[r.employmentType] ?? r.employmentType,
      r.hireDate.slice(0, 10),
      r.active ? "在職" : "已停用",
      r.balance.entitlement,
      r.balance.adjustments,
      r.balance.used,
      r.balance.pending,
      r.balance.remaining,
      r.thisMonthUsed,
      r.pendingCount,
    ]);
    const csv =
      "﻿" +
      [header, ...body]
        .map((row) =>
          row
            .map((cell) => {
              const s = String(cell);
              return s.includes(",") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"`
                : s;
            })
            .join(","),
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `員工列表-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold">
            員工（{totals.visible} / {rows.length} 人）
          </h2>
          {totals.pending > 0 && (
            <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              {totals.pending} 筆待審
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setBatchMode((b) => !b)}
            icon={batchMode ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
          >
            {batchMode ? `已選 ${totals.selected}` : "選取"}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowFilters((s) => !s)}
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          >
            篩選
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={exportCsv}
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
          >
            匯出
          </Button>
        </div>
      </div>

      {/* 搜尋 */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋姓名、員編、Email、部門、職稱…"
          className="input w-full pl-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            aria-label="清除"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 篩選 chips */}
      {showFilters && (
        <div className="glass-subtle flex flex-wrap items-center gap-3 rounded-2xl p-3 text-xs">
          <Chip
            label="狀態"
            value={activeFilter}
            onChange={(v) => setActiveFilter(v as ActiveFilter)}
            options={[
              { value: "active", label: "在職" },
              { value: "inactive", label: "已停用" },
              { value: "all", label: "全部" },
            ]}
          />
          {depts.length > 0 && (
            <Chip
              label="部門"
              value={deptFilter}
              onChange={setDeptFilter}
              options={[{ value: "all", label: "全部" }, ...depts.map((d) => ({ value: d, label: d }))]}
            />
          )}
          {employments.length > 0 && (
            <Chip
              label="雇用"
              value={employmentFilter}
              onChange={setEmploymentFilter}
              options={[
                { value: "all", label: "全部" },
                ...employments.map((e) => ({
                  value: e,
                  label:
                    { FULL_TIME: "正職", PART_TIME: "兼職", CONTRACT: "約聘", INTERN: "實習" }[e] ??
                    e,
                })),
              ]}
            />
          )}
          <Chip
            label="排序"
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            options={[
              { value: "employeeNo", label: "員編" },
              { value: "hireDate", label: "到職日" },
              { value: "remaining", label: "剩餘天數" },
              { value: "monthUsed", label: "本月已用" },
              { value: "pending", label: "待審件數" },
            ]}
          />
          <button
            type="button"
            onClick={() => setSortAsc((a) => !a)}
            className="rounded-full border border-slate-300/40 bg-white/50 px-2 py-0.5 hover:bg-white/80 dark:bg-slate-800/40"
          >
            {sortAsc ? "升冪 ↑" : "降冪 ↓"}
          </button>
        </div>
      )}

      {/* 批次操作列 */}
      {batchMode && (
        <div className="glass-subtle flex items-center gap-2 rounded-2xl px-3 py-2 text-xs">
          <button type="button" onClick={toggleAll} className="font-medium text-ios-blue hover:underline">
            {selected.size === filtered.length ? "取消全選" : "全選本頁"}
          </button>
          <span className="text-slate-500">已選 {selected.size} 位</span>
          <Button variant="ghost" size="xs" onClick={exportCsv} disabled={selected.size === 0}>
            匯出所選
          </Button>
          <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
            清除選取
          </Button>
        </div>
      )}

      {/* 列表 */}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">沒有符合條件的員工。</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <SubordinateRow
              key={r.id}
              row={r}
              isAdmin={isAdmin}
              batchMode={batchMode}
              selected={selected.has(r.id)}
              onToggleSelected={() => toggleSelected(r.id)}
              onPatch={(patch) => updateRow(r.id, patch)}
            />
          ))}
        </ul>
      )}

      {/* 總計 */}
      <div className="pt-2 text-right text-xs text-slate-500">
        合計剩餘天數 <strong className="text-slate-700">{totals.remaining}</strong> 天 · 共 {totals.visible} 人
      </div>
    </div>
  );
}

function Chip({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-slate-300/40 bg-white/50 px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-ios-blue/30 dark:bg-slate-800/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
