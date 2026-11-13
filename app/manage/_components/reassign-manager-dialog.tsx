"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import type { SubordinateRow } from "./types";

type Manager = {
  id: string;
  name: string;
  employeeNo: string;
  department: string | null;
  role: string;
};

export function ReassignManagerDialog({
  row,
  onClose,
  onPatched,
}: {
  row: SubordinateRow;
  onClose: () => void;
  onPatched: () => void;
}) {
  const [managers, setManagers] = useState<Manager[] | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/managers");
      const data = await res.json().catch(() => ({ managers: [] }));
      if (cancelled) return;
      // 不能把自己指派給自己當主管
      setManagers((data.managers ?? []).filter((m: Manager) => m.id !== row.id));
    })();
    return () => {
      cancelled = true;
    };
  }, [row.id]);

  const filtered = useMemo(() => {
    if (!managers) return [];
    const q = query.trim().toLowerCase();
    if (!q) return managers;
    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.employeeNo.toLowerCase().includes(q) ||
        (m.department ?? "").toLowerCase().includes(q),
    );
  }, [managers, query]);

  async function submit() {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/users/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: selected || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "指派失敗");
        return;
      }
      toast.success(selected ? "已指派新主管" : "已移除主管");
      onPatched();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open onClose={onClose} variant="center" maxWidth="md">
      <DialogHeader
        icon={<Users className="h-5 w-5 text-ios-blue" />}
        title={`指派 ${row.name} 的直屬主管`}
        subtitle="只列出在職的主管 / HR。空值 = 沒有主管"
        onClose={onClose}
      />
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋姓名 / 員編 / 部門"
            className="input w-full pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto overscroll-contain rounded-2xl bg-white/40 dark:bg-slate-800/30">
          {managers === null ? (
            <div className="flex items-center justify-center gap-2 p-6 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              載入中…
            </div>
          ) : (
            <ul className="divide-y divide-white/40 dark:divide-slate-700/40">
              <li>
                <button
                  type="button"
                  onClick={() => setSelected("")}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                    selected === "" ? "bg-ios-blue/15 text-ios-blue" : "hover:bg-white/50 dark:hover:bg-slate-700/40"
                  }`}
                >
                  <span className="text-slate-500 italic">— 不設主管 —</span>
                </button>
              </li>
              {filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(m.id)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                      selected === m.id
                        ? "bg-ios-blue/15 text-ios-blue"
                        : "hover:bg-white/50 dark:hover:bg-slate-700/40"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {m.name}
                        <span className="ml-1 text-xs font-normal text-slate-500">{m.employeeNo}</span>
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {m.department ?? "—"} · {m.role === "ADMIN" ? "HR" : "主管"}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="p-6 text-center text-xs text-slate-500">沒有符合的主管</li>
              )}
            </ul>
          )}
        </div>

        <div className="flex justify-end">
          <SubmitButton pending={pending} onClick={submit} type="button" loadingText="送出中…">
            確認指派
          </SubmitButton>
        </div>
      </div>
    </Dialog>
  );
}
