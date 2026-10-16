"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { WalletIcon } from "@/components/icons/glass-icons";

export function ProcessForm({
  userId,
  userName,
  anniversaryYearStart,
  unusedDays,
}: {
  userId: string;
  userName: string;
  anniversaryYearStart: string;
  unusedDays: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    const amountNum = amount ? parseFloat(amount) : null;
    if (amount && (isNaN(amountNum!) || amountNum! < 0)) {
      toast.error("折發金額需為非負數字");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          anniversaryYearStart,
          unusedDays,
          payoutAmount: amountNum,
          note: note || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "失敗");
        return;
      }
      toast.success(`${userName} 已結算 ${unusedDays} 天`);
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="primary"
        size="xs"
        onClick={() => setOpen(true)}
        icon={<WalletIcon className="h-3 w-3" />}
      >
        結算
      </Button>
    );
  }

  return (
    <div className="glass-subtle space-y-2 rounded-2xl p-3">
      <div className="text-xs font-medium text-slate-700">
        結算 {userName}（{unusedDays} 天）
      </div>
      <input
        type="number"
        step="1"
        placeholder="折發金額（NT$）"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input py-1.5 text-xs"
      />
      <input
        placeholder="備註（可空）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
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
          結算
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
