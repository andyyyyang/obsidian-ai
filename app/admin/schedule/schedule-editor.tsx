"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Save, Send } from "lucide-react";
import { toast } from "sonner";

const WEEKDAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

type User = { id: string; name: string; employeeNo: string; department: string | null };
type ShiftCell = {
  id?: string;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
  isPublished?: boolean;
};

const EMPTY: ShiftCell = { startTime: null, endTime: null, note: null };
const DEFAULT_SHIFT: ShiftCell = { startTime: "09:00", endTime: "18:00", note: null };

export function ScheduleEditor({
  weekStart,
  days,
  users,
  initialShifts,
}: {
  weekStart: string;
  days: string[];
  users: User[];
  initialShifts: Record<string, ShiftCell>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [shifts, setShifts] = useState<Record<string, ShiftCell>>(initialShifts);
  const [editing, setEditing] = useState<{ userId: string; date: string } | null>(null);
  const [draft, setDraft] = useState<ShiftCell>(EMPTY);

  function keyOf(userId: string, date: string) {
    return `${userId}|${date}`;
  }

  function setCell(userId: string, date: string, value: ShiftCell) {
    setShifts((m) => ({ ...m, [keyOf(userId, date)]: value }));
  }

  function openCell(userId: string, date: string) {
    const k = keyOf(userId, date);
    setEditing({ userId, date });
    setDraft(shifts[k] ?? DEFAULT_SHIFT);
  }

  function saveCellLocal() {
    if (!editing) return;
    setCell(editing.userId, editing.date, draft);
    setEditing(null);
  }

  function clearCellLocal() {
    if (!editing) return;
    setCell(editing.userId, editing.date, EMPTY);
    setEditing(null);
  }

  // 把整列複製到該員工的所有上班日 (週一~五)
  function applyToWeek(userId: string, base: ShiftCell) {
    const next = { ...shifts };
    for (let i = 0; i < 5; i++) {
      next[keyOf(userId, days[i])] = base;
    }
    setShifts(next);
  }

  // 全員套用標準班 9-18 週一~五
  function applyStandardToAll() {
    if (!confirm("全員週一到週五套用 09:00-18:00？(週六日休)")) return;
    const next = { ...shifts };
    for (const u of users) {
      for (let i = 0; i < 5; i++) {
        next[keyOf(u.id, days[i])] = { startTime: "09:00", endTime: "18:00", note: null };
      }
      next[keyOf(u.id, days[5])] = EMPTY;
      next[keyOf(u.id, days[6])] = EMPTY;
    }
    setShifts(next);
  }

  function save(publish: boolean) {
    // 收集所有有變更的格 (含空)
    const assignments: any[] = [];
    for (const u of users) {
      for (const d of days) {
        const cell = shifts[keyOf(u.id, d)];
        if (!cell) continue;
        assignments.push({
          userId: u.id,
          date: d,
          startTime: cell.startTime,
          endTime: cell.endTime,
          note: cell.note,
        });
      }
    }
    if (assignments.length === 0) {
      toast.error("沒有班表可儲存");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments, publish }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "失敗");
        return;
      }
      toast.success(publish ? `已發佈 ${data.count} 筆班表` : `已儲存 ${data.count} 筆草稿`);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button onClick={applyStandardToAll} className="btn-ghost text-xs">
          <Copy className="h-3.5 w-3.5" />
          全員套用標準班
        </button>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={pending} className="btn-ghost">
            <Save className="h-4 w-4" />
            存草稿
          </button>
          <button onClick={() => save(true)} disabled={pending} className="btn-primary">
            <Send className="h-4 w-4" />
            發佈班表
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-10 bg-white/80 px-3 py-2 text-left">員工</th>
              {days.map((d, i) => (
                <th key={d} className="px-2 py-2 text-center">
                  <div>{WEEKDAYS[i]}</div>
                  <div className="text-[10px] text-slate-400">{d.slice(5)}</div>
                </th>
              ))}
              <th className="px-2 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="sticky left-0 z-10 whitespace-nowrap bg-white/80 px-3 py-2">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-500">
                    {u.employeeNo} · {u.department ?? "—"}
                  </div>
                </td>
                {days.map((d) => {
                  const cell = shifts[keyOf(u.id, d)];
                  const isEditing = editing?.userId === u.id && editing?.date === d;
                  return (
                    <td key={d} className="px-1 py-1 text-center">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 rounded-md border border-blue-300 bg-blue-50 p-1">
                          <input
                            type="time"
                            value={draft.startTime ?? ""}
                            onChange={(e) =>
                              setDraft({ ...draft, startTime: e.target.value || null })
                            }
                            className="rounded border px-1 text-xs"
                          />
                          <input
                            type="time"
                            value={draft.endTime ?? ""}
                            onChange={(e) => setDraft({ ...draft, endTime: e.target.value || null })}
                            className="rounded border px-1 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="備註"
                            maxLength={50}
                            value={draft.note ?? ""}
                            onChange={(e) => setDraft({ ...draft, note: e.target.value || null })}
                            className="rounded border px-1 text-xs"
                          />
                          <div className="flex gap-1">
                            <button onClick={saveCellLocal} className="flex-1 rounded bg-blue-500 text-xs text-white py-0.5">
                              OK
                            </button>
                            <button onClick={clearCellLocal} className="flex-1 rounded bg-slate-300 text-xs py-0.5">
                              休
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openCell(u.id, d)}
                          className="w-full rounded-md p-1 transition hover:bg-blue-50"
                        >
                          {cell ? (
                            cell.startTime ? (
                              <div className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 tabular-nums">
                                {cell.startTime}<br />~{cell.endTime}
                              </div>
                            ) : (
                              <div className="rounded-md bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">
                                休
                              </div>
                            )
                          ) : (
                            <span className="text-slate-300">＋</span>
                          )}
                          {cell?.isPublished && (
                            <CheckCircle2 className="mx-auto mt-0.5 h-3 w-3 text-emerald-500" />
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
                <td className="px-1">
                  <button
                    onClick={() => applyToWeek(u.id, DEFAULT_SHIFT)}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    title="此員工套用週一~五 09-18"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        綠色勾代表已發佈，員工可看到。空白格未儲存。
      </div>
    </div>
  );
}
