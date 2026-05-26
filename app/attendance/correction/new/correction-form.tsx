"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CorrectionForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("CLOCK_IN");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time || !reason.trim()) {
      toast.error("請填寫完整");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/attendance/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, type, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "送出失敗");
        return;
      }
      toast.success("已送出申請，等待主管審核");
      router.push("/attendance");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">日期</label>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">時間</label>
        <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">類別</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="CLOCK_IN">上班</option>
          <option value="CLOCK_OUT">下班</option>
          <option value="BREAK_OUT">外出</option>
          <option value="BREAK_IN">回來</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">原因</label>
        <textarea
          className="input min-h-[100px]"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例：手機沒電忘記打卡"
          required
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending ? "送出中…" : "送出申請"}
      </button>
    </form>
  );
}
