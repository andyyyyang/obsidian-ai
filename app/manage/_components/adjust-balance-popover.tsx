"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import { WalletIcon } from "@/components/icons/glass-icons";
import type { SubordinateRow } from "./types";

export function AdjustBalancePopover({
  row,
  onClose,
  onAdjusted,
}: {
  row: SubordinateRow;
  onClose: () => void;
  onAdjusted: (delta: number) => void;
}) {
  const [days, setDays] = useState<string>("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const d = parseFloat(days);
    if (isNaN(d) || d === 0) {
      toast.error("天數需為非 0 數字（正或負）");
      return;
    }
    if (!reason.trim()) {
      toast.error("請填寫調整原因");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/balance-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: row.id, days: d, reason: reason.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "調整失敗");
        return;
      }
      toast.success(`已調整 ${d > 0 ? "+" : ""}${d} 天`);
      onAdjusted(d);
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open onClose={onClose} variant="center" maxWidth="sm">
      <DialogHeader
        icon={<WalletIcon className="h-5 w-5" />}
        title={`調整 ${row.name} 的特休餘額`}
        subtitle={`員編 ${row.employeeNo} · 目前剩餘 ${row.balance.remaining} 天`}
        onClose={onClose}
      />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            天數（正數=增加，負數=扣除）
          </label>
          <input
            type="number"
            step="0.5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="例如：+2 或 -1"
            className="input"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            調整原因（會記在稽核紀錄）
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="例如：補償 2024 年度未休完的 2 天"
            className="input"
          />
        </div>
        <div className="rounded-xl bg-slate-100/60 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
          目前：配額 {row.balance.entitlement} + 調整 {row.balance.adjustments} − 已用{" "}
          {row.balance.used} − 申請中 {row.balance.pending} = <strong>剩餘 {row.balance.remaining}</strong>
        </div>
        <div className="flex justify-end gap-2">
          <SubmitButton pending={pending} loadingText="送出中…">
            確認調整
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
