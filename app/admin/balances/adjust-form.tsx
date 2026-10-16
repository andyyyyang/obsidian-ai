"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

export function AdjustForm({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    const n = parseFloat(days);
    if (isNaN(n) || n === 0) {
      toast.error("請輸入非零數字（可正可負）");
      return;
    }
    if (!reason.trim()) {
      toast.error("請填寫原因");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/balance-adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, days: n, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "失敗");
        return;
      }
      toast.success(`已調整 ${userName} ${n > 0 ? "+" : ""}${n} 天`);
      setOpen(false);
      setDays("");
      setReason("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setOpen(true)}
        icon={<Pencil className="h-3 w-3" />}
      >
        調整
      </Button>
    );
  }

  return (
    <div className="glass-subtle space-y-2 rounded-2xl p-3">
      <div className="text-xs font-medium text-slate-700">調整 {userName}</div>
      <input
        type="number"
        step="0.5"
        placeholder="±天數"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="input py-1.5 text-xs"
      />
      <input
        placeholder="原因"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="input py-1.5 text-xs"
      />
      <div className="flex gap-1.5">
        <SubmitButton
          type="button"
          pending={pending}
          size="xs"
          onClick={submit}
          icon={<Check className="h-3 w-3" />}
          fullWidth
        >
          確認
        </SubmitButton>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setOpen(false)}
          icon={<X className="h-3 w-3" />}
          aria-label="取消"
        />
      </div>
    </div>
  );
}
