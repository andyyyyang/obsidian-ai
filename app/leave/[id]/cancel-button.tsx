"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/submit-button";

export function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleCancel() {
    if (!confirm("確定要取消這筆申請嗎？取消後不可恢復。")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/leave-requests/${id}/cancel`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "取消失敗");
        return;
      }
      toast.success("已取消這筆申請");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <SubmitButton
      type="button"
      pending={pending}
      loadingText="取消中…"
      variant="danger"
      icon={<XCircle className="h-4 w-4" />}
      onClick={handleCancel}
    >
      取消這筆申請
    </SubmitButton>
  );
}
