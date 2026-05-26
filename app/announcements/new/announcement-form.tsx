"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Pin } from "lucide-react";
import { toast } from "sonner";

export function AnnouncementForm() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [publishedAt, setPublishedAt] = useState(today);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("請填標題與內容");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          pinned,
          publishedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "發佈失敗");
        return;
      }
      toast.success("已發佈");
      router.push("/announcements");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">標題</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：本週重點事項"
          maxLength={120}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">內容</label>
        <textarea
          className="input min-h-[200px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="輸入公告內容..."
          maxLength={5000}
          required
        />
        <div className="mt-1 text-right text-xs text-slate-400">{content.length}/5000</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">發佈日期</label>
          <input
            type="date"
            className="input"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4"
            />
            <Pin className="h-4 w-4 text-amber-500" />
            置頂顯示
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          <Megaphone className="h-4 w-4" />
          {pending ? "發佈中…" : "發佈公告"}
        </button>
      </div>
    </form>
  );
}
