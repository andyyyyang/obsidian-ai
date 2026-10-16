"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

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
  const popoverRef = useRef<HTMLDivElement>(null);

  // 點外面關閉
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

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

  return (
    <div className="relative inline-block">
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
          <Pencil className="h-2.5 w-2.5 text-slate-400 opacity-0 group-hover:opacity-100" />
        </span>
        <span className="whitespace-nowrap text-slate-500">~ {cycleEnd}</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="glass-strong absolute left-0 top-full z-30 mt-1 w-60 rounded-2xl p-3 shadow-xl"
        >
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
            <button
              onClick={save}
              disabled={pending || !value}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-ios-blue to-ios-indigo px-2 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              儲存
            </button>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-xl bg-white/60 px-2 py-1.5 text-xs text-slate-700 hover:bg-white/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
