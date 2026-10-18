"use client";

import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ResetPasswordDialog({
  name,
  password,
  onClose,
}: {
  name: string;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("已複製");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("複製失敗，請手動選取");
    }
  }

  return (
    <Dialog open onClose={onClose} variant="center" maxWidth="sm">
      <DialogHeader
        icon={<KeyRound className="h-5 w-5 text-amber-500" />}
        title={`${name} 的新臨時密碼`}
        subtitle="這組密碼只會顯示這一次，請立刻記下來並親自轉達員工。"
        onClose={onClose}
      />
      <div className="space-y-4">
        <div className="relative">
          <code className="block select-all break-all rounded-2xl bg-slate-900 px-4 py-3 text-center font-mono text-lg tracking-widest text-emerald-300">
            {password}
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label="複製密碼"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-slate-700/80 p-2 text-white hover:bg-slate-600"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="rounded-xl bg-amber-50/60 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠ 舊密碼已立刻失效，員工下次登入請用這組新密碼。建議請員工登入後自行改密碼。
        </div>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            我已記下
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
