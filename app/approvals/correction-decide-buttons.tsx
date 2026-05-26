"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function CorrectionDecideButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function decide(decision: "APPROVED" | "REJECTED") {
    const reviewNote = decision === "REJECTED" ? prompt("退回原因？") : undefined;
    if (decision === "REJECTED" && !reviewNote) return;
    startTransition(async () => {
      const res = await fetch(`/api/attendance/correction/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "處理失敗");
        return;
      }
      toast.success(decision === "APPROVED" ? "已核准" : "已退回");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => decide("APPROVED")} disabled={pending} className="btn-success">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        核准補登
      </button>
      <button onClick={() => decide("REJECTED")} disabled={pending} className="btn-ghost text-rose-700">
        <XCircle className="h-4 w-4" />
        退回
      </button>
    </div>
  );
}
