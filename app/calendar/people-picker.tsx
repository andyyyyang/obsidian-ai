"use client";

import { useMemo, useState } from "react";
import { Users, Search, X, Check } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type Person = {
  id: string;
  name: string;
  employeeNo: string;
  department: string | null;
};

export function PeoplePicker({
  people,
  meId,
  focus,
  onChange,
}: {
  people: Person[];
  meId: string;
  focus: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const focusSet = useMemo(() => new Set(focus), [focus]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.employeeNo.toLowerCase().includes(q) ||
        (p.department ?? "").toLowerCase().includes(q),
    );
  }, [people, query]);

  const label = useMemo(() => {
    if (focus.length === 0) return "全部員工";
    if (focus.length === 1) {
      const p = people.find((x) => x.id === focus[0]);
      if (!p) return "1 位";
      return p.id === meId ? "僅我" : p.name;
    }
    return `${focus.length} 位`;
  }, [focus, people, meId]);

  function toggle(id: string) {
    const next = new Set(focusSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      align="end"
      width="18rem"
      trigger={
        <Button
          variant={focus.length > 0 ? "primary" : "ghost"}
          size="xs"
          onClick={() => setOpen((o) => !o)}
          icon={<Users className="h-3.5 w-3.5" />}
        >
          {label}
        </Button>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              onChange([]);
              setOpen(false);
            }}
            className="flex-1 rounded-xl bg-white/60 px-2 py-1.5 font-medium hover:bg-white/90 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => {
              onChange([meId]);
              setOpen(false);
            }}
            className="flex-1 rounded-xl bg-white/60 px-2 py-1.5 font-medium hover:bg-white/90 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
          >
            僅我
          </button>
          {focus.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-xl bg-rose-50 px-2 py-1.5 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300"
              aria-label="清除"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋姓名 / 員編 / 部門"
            className="input w-full py-1.5 pl-8 pr-2 text-xs"
            autoFocus
          />
        </div>

        <ul className="max-h-64 space-y-0.5 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="py-4 text-center text-xs text-slate-500">沒有符合的人</li>
          )}
          {filtered.map((p) => {
            const checked = focusSet.has(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs transition ${
                    checked
                      ? "bg-ios-blue/15 text-ios-blue"
                      : "hover:bg-white/70 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                      checked
                        ? "border-ios-blue bg-ios-blue text-white"
                        : "border-slate-300 bg-white/60 dark:border-slate-600 dark:bg-slate-800/40"
                    }`}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="flex-1 truncate">
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-1 text-slate-500">{p.employeeNo}</span>
                    {p.id === meId && <span className="ml-1 text-amber-500">· 我</span>}
                  </span>
                  {p.department && (
                    <span className="flex-shrink-0 text-slate-400">{p.department}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Popover>
  );
}
