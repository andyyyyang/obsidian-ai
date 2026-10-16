"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";

export function EditHireDate({
  userId,
  userName,
  currentHireDate,
  cycleStart,
  cycleEnd,
}: {
  userId: string;
  userName: string;
  currentHireDate: string;
  cycleStart: string;
  cycleEnd: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentHireDate);
  const [pending, setPending] = useState(false);

  async function save() {
    if (!value || value === currentHireDate) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hireDate: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "更新失敗");
        return;
      }
      toast.success(`已更新 ${userName} 到職日為 ${value}`);
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const trigger = (
    <button
      onClick={() => {
        setValue(currentHireDate);
        setOpen((o) => !o);
      }}
      className="group inline-flex flex-col items-start gap-0.5 rounded-lg px-2 py-1 text-left text-xs transition-colors hover:bg-ios-blue/10"
      title="點擊修改到職日 → 自動更新週期"
    >
      <span className="flex items-center gap-1 whitespace-nowrap">
        {cycleStart}
        <Pencil className="h-2.5 w-2.5 flex-shrink-0 text-slate-400 opacity-0 group-hover:opacity-100" />
      </span>
      <span className="whitespace-nowrap text-slate-500">~ {cycleEnd}</span>
    </button>
  );

  return (
    <Popover open={open} onClose={() => setOpen(false)} trigger={trigger} width="15rem">
      <div className="mb-2 text-xs text-slate-500">
        編輯 <strong className="text-slate-900">{userName}</strong> 到職日
      </div>
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input !py-1.5 text-xs"
        autoFocus
      />
      <p className="mt-1.5 text-[10px] text-slate-500">
        勞基法以到職週年日計算特休，改到職日 = 改週期
      </p>
      <div className="mt-2 flex gap-1.5">
        <Button
          variant="primary"
          size="xs"
          onClick={save}
          loading={pending}
          loadingText="儲存中…"
          disabled={!value}
          icon={<Check className="h-3 w-3" />}
          fullWidth
        >
          儲存
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(false)}
          aria-label="取消"
        />
      </div>
    </Popover>
  );
}
