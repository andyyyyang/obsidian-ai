"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Schedule = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workDays: number;
  lateGraceMinutes: number;
  officeId: string | null;
  officeName: string | null;
};

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function workDaysLabel(bits: number): string {
  return WEEKDAYS.filter((_, i) => (bits & (1 << i)) !== 0).join(" / ");
}

export function ScheduleManager({
  initialSchedules,
  offices,
}: {
  initialSchedules: Schedule[];
  offices: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<{
    name: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    workDays: number;
    lateGraceMinutes: number;
    officeId: string;
  }>({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: 60,
    workDays: 62, // 週一~五
    lateGraceMinutes: 0,
    officeId: "",
  });

  function toggleDay(i: number) {
    const bit = 1 << i;
    setDraft({ ...draft, workDays: (draft.workDays & bit) !== 0 ? draft.workDays & ~bit : draft.workDays | bit });
  }

  function create() {
    if (!draft.name) {
      toast.error("請填班別名稱");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, officeId: draft.officeId || null }),
      });
      if (!res.ok) {
        toast.error("新增失敗");
        return;
      }
      toast.success("已新增");
      setDraft({ ...draft, name: "" });
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("確定刪除？已指派此班別的員工將失去班別。")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("刪除失敗");
        return;
      }
      setSchedules(schedules.filter((s) => s.id !== id));
      router.refresh();
    });
  }

  return (
    <div>
      <ul className="mb-6 space-y-2">
        {schedules.map((s) => (
          <li key={s.id} className="glass-subtle flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-slate-500">
                {s.startTime} ~ {s.endTime} · 午休 {s.breakMinutes} 分 · {workDaysLabel(s.workDays)}
                {s.lateGraceMinutes > 0 && ` · 寬限 ${s.lateGraceMinutes} 分`}
                {s.officeName && ` · ${s.officeName}`}
              </div>
            </div>
            <button onClick={() => remove(s.id)} className="text-rose-500 hover:text-rose-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {schedules.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            尚未設定任何班別
          </li>
        )}
      </ul>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-3 text-sm font-semibold">新增班別</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="input" placeholder="班別名稱（例：標準班）" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <select className="input" value={draft.officeId} onChange={(e) => setDraft({ ...draft, officeId: e.target.value })}>
            <option value="">不限地點</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <input className="input" type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
          <input className="input" type="time" value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
          <input className="input" type="number" placeholder="午休扣除（分）" value={draft.breakMinutes} onChange={(e) => setDraft({ ...draft, breakMinutes: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="遲到寬限（分）" value={draft.lateGraceMinutes} onChange={(e) => setDraft({ ...draft, lateGraceMinutes: Number(e.target.value) })} />
        </div>
        <div className="mt-3">
          <div className="mb-2 text-xs text-slate-500">工作日</div>
          <div className="flex gap-2">
            {WEEKDAYS.map((d, i) => {
              const on = (draft.workDays & (1 << i)) !== 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`h-9 w-9 rounded-full text-sm font-medium transition ${
                    on ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={create} disabled={pending} className="btn-primary">
            <Plus className="h-4 w-4" />
            新增
          </button>
        </div>
      </div>
    </div>
  );
}
