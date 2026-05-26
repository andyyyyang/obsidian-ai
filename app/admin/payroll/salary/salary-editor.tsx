"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

type Config = {
  type: string;
  amount: number;
  fullAttendanceBonus: number;
  lateDeductionPerMinute: number;
  leaveDeductPerDay: number | null;
  laborInsurance: number;
  healthInsurance: number;
  laborPensionSelf: number;
};

export function SalaryEditor({
  userId,
  schedules,
  currentScheduleId,
  initialConfig,
}: {
  userId: string;
  schedules: { id: string; name: string }[];
  currentScheduleId: string;
  initialConfig: Config | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [scheduleId, setScheduleId] = useState(currentScheduleId);
  const [c, setC] = useState<Config>(
    initialConfig ?? {
      type: "MONTHLY",
      amount: 0,
      fullAttendanceBonus: 0,
      lateDeductionPerMinute: 0,
      leaveDeductPerDay: null,
      laborInsurance: 0,
      healthInsurance: 0,
      laborPensionSelf: 0,
    },
  );

  function save() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...c, scheduleId: scheduleId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "儲存失敗");
        return;
      }
      toast.success("已儲存");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost text-xs">
        編輯
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">薪資制</label>
          <select className="input" value={c.type} onChange={(e) => setC({ ...c, type: e.target.value })}>
            <option value="MONTHLY">月薪</option>
            <option value="HOURLY">時薪</option>
            <option value="DAILY">日薪</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">金額（NTD）</label>
          <input className="input" type="number" value={c.amount} onChange={(e) => setC({ ...c, amount: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">班別</label>
          <select className="input" value={scheduleId} onChange={(e) => setScheduleId(e.target.value)}>
            <option value="">不指派</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">全勤獎金</label>
          <input className="input" type="number" value={c.fullAttendanceBonus} onChange={(e) => setC({ ...c, fullAttendanceBonus: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">遲到扣款 / 分鐘</label>
          <input className="input" type="number" step="0.1" value={c.lateDeductionPerMinute} onChange={(e) => setC({ ...c, lateDeductionPerMinute: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">請假扣款 / 天（空白用月薪比例）</label>
          <input className="input" type="number" value={c.leaveDeductPerDay ?? ""} onChange={(e) => setC({ ...c, leaveDeductPerDay: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">勞保自負額（月）</label>
          <input className="input" type="number" value={c.laborInsurance} onChange={(e) => setC({ ...c, laborInsurance: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">健保自負額（月）</label>
          <input className="input" type="number" value={c.healthInsurance} onChange={(e) => setC({ ...c, healthInsurance: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">勞退自願提撥（月）</label>
          <input className="input" type="number" value={c.laborPensionSelf} onChange={(e) => setC({ ...c, laborPensionSelf: Number(e.target.value) })} />
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="btn-ghost">取消</button>
        <button onClick={save} disabled={pending} className="btn-primary">
          <Save className="h-4 w-4" />
          儲存
        </button>
      </div>
    </div>
  );
}
