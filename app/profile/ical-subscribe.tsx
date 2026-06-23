"use client";

import { useState } from "react";
import { CalendarDays, Check, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function IcalSubscribe({ url }: { url: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("已複製訂閱網址");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("複製失敗，請手動複製");
    }
  }

  // mask 中段
  const masked = url.replace(/\/ical\/([^.]{12})([^.]+)/, "/ical/$1•••••••");

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        把這條網址加入你的 Calendar app（iOS Calendar / Google Calendar / Outlook
        皆支援），就能在手機上即時看到所有人的請假、生日與週年。
      </p>

      <div className="glass-subtle flex items-center gap-2 rounded-2xl p-2">
        <CalendarDays className="ml-1 h-4 w-4 flex-shrink-0 text-ios-indigo" />
        <input
          readOnly
          value={show ? url : masked}
          className="flex-1 bg-transparent text-xs font-mono text-slate-700 focus:outline-none dark:text-slate-300"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button onClick={() => setShow((s) => !s)} className="btn-ghost h-8 w-8 !px-0" title={show ? "隱藏" : "顯示"}>
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button onClick={copy} className="btn-primary !py-1.5 text-xs">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "已複製" : "複製"}
        </button>
      </div>

      <details className="glass-subtle rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-300">
        <summary className="cursor-pointer font-medium">📱 怎麼加到 iPhone / Android？</summary>
        <div className="mt-3 space-y-3 text-xs">
          <div>
            <strong className="text-slate-900 dark:text-slate-100">iPhone</strong>
            <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-slate-500">
              <li>設定 → 行事曆 → 帳號 → 加入帳號 → 其他</li>
              <li>「加入已訂閱行事曆」</li>
              <li>貼上上方網址 → 下一步</li>
            </ol>
          </div>
          <div>
            <strong className="text-slate-900 dark:text-slate-100">Google Calendar（網頁版）</strong>
            <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-slate-500">
              <li>左側「其他日曆」旁的 ＋ → 從網址</li>
              <li>貼上網址 → 新增日曆</li>
            </ol>
          </div>
          <div>
            <strong className="text-slate-900 dark:text-slate-100">Outlook</strong>
            <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-slate-500">
              <li>行事曆 → 從網際網路新增行事曆 → 貼上網址</li>
            </ol>
          </div>
        </div>
      </details>

      <p className="text-[11px] text-slate-400">
        ⚠ 此網址包含你的個人 token，請勿分享給他人。同步約每小時更新一次。
      </p>
    </div>
  );
}
