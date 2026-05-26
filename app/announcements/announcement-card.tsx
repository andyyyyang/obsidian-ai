"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass-card";

type Announcement = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  publishedAt: string;
  authorId: string;
  authorName: string;
  authorJobTitle: string | null;
};

export function AnnouncementCard({
  announcement,
  canEdit,
}: {
  announcement: Announcement;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pinned, setPinned] = useState(announcement.pinned);

  function togglePin() {
    const next = !pinned;
    setPinned(next);
    startTransition(async () => {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: next }),
      });
      if (!res.ok) {
        setPinned(!next);
        toast.error("操作失敗");
      } else {
        toast.success(next ? "已置頂" : "已取消置頂");
        router.refresh();
      }
    });
  }

  function remove() {
    if (!confirm(`刪除「${announcement.title}」？`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/announcements/${announcement.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("刪除失敗");
      } else {
        toast.success("已刪除");
        router.refresh();
      }
    });
  }

  const date = new Date(announcement.publishedAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Taipei",
  });

  return (
    <GlassCard variant="strong" className={`p-5 ${pinned ? "border-amber-300 ring-2 ring-amber-200/50" : ""}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Pin className="h-3 w-3" />
              置頂
            </span>
          )}
          <h2 className="text-lg font-bold text-slate-900">{announcement.title}</h2>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={togglePin}
              disabled={pending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-amber-600"
              title={pinned ? "取消置頂" : "置頂"}
            >
              {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
            <button
              onClick={remove}
              disabled={pending}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              title="刪除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-3 text-xs text-slate-500">
        {announcement.authorName}
        {announcement.authorJobTitle && ` · ${announcement.authorJobTitle}`}
        <span className="mx-1.5">·</span>
        {date}
      </div>

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {announcement.content}
      </div>
    </GlassCard>
  );
}
