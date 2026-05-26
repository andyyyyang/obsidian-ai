"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AvatarPreview } from "@/components/avatar-preview";
import type { AvatarLook } from "@/lib/pixel-art";

type Message = {
  id: string;
  authorId: string;
  authorName: string;
  authorDepartment: string | null;
  isSelf: boolean;
  look: AvatarLook;
  content: string;
  createdAt: string;
};

const POLL_MS = 4000;

export function ChatRoom({ currentUserId, role }: { currentUserId: string; role: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const isMod = role === "ADMIN" || role === "MANAGER";

  // 初次載入
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/chat?limit=200", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (cancelled) return;
      setMessages(data.messages);
      if (data.messages.length) {
        lastTimestampRef.current = data.messages[data.messages.length - 1].createdAt;
      }
      requestAnimationFrame(() => scrollToBottom("auto"));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 輪詢新訊息
  useEffect(() => {
    const id = setInterval(async () => {
      const since = lastTimestampRef.current;
      const url = since ? `/api/chat?since=${encodeURIComponent(since)}` : "/api/chat?limit=200";
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.messages.length) return;
        if (since) {
          // 增量 append
          setMessages((prev) => mergeUnique(prev, data.messages));
        } else {
          setMessages(data.messages);
        }
        lastTimestampRef.current = data.messages[data.messages.length - 1].createdAt;
        scrollToBottom();
      } catch {
        // 忽略
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function send() {
    const value = input.trim();
    if (!value) return;
    setInput("");
    startTransition(async () => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "送出失敗");
        setInput(value); // 還原
        return;
      }
      // 立即抓最新
      const ts = lastTimestampRef.current;
      const url = ts ? `/api/chat?since=${encodeURIComponent(ts)}` : "/api/chat?limit=200";
      const fresh = await fetch(url, { cache: "no-store" });
      if (fresh.ok) {
        const d = await fresh.json();
        if (d.messages.length) {
          setMessages((prev) => mergeUnique(prev, d.messages));
          lastTimestampRef.current = d.messages[d.messages.length - 1].createdAt;
          scrollToBottom();
        }
      }
      inputRef.current?.focus();
    });
  }

  function remove(id: string) {
    if (!confirm("刪除這則訊息？")) return;
    fetch(`/api/chat/${id}`, { method: "DELETE" }).then((res) => {
      if (res.ok) {
        setMessages((m) => m.filter((x) => x.id !== id));
        toast.success("已刪除");
      } else {
        toast.error("刪除失敗");
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* 訊息區 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            還沒有人開始聊天，當第一個！
          </div>
        ) : (
          <ul className="space-y-3">
            {groupByDate(messages).map(({ date, items }) => (
              <li key={date}>
                <div className="my-3 text-center text-xs text-slate-400">{date}</div>
                <ul className="space-y-2">
                  {items.map((m, i) => {
                    const prev = items[i - 1];
                    const isStart = !prev || prev.authorId !== m.authorId || timeDiffSec(prev.createdAt, m.createdAt) > 300;
                    return (
                      <Message
                        key={m.id}
                        m={m}
                        showHeader={isStart}
                        canDelete={m.authorId === currentUserId || isMod}
                        onDelete={() => remove(m.id)}
                      />
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 輸入區 */}
      <div className="border-t border-white/40 bg-white/30 p-3 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入訊息…"
            maxLength={500}
            disabled={pending}
            className="input flex-1"
          />
          <button type="submit" disabled={pending || !input.trim()} className="btn-primary">
            <Send className="h-4 w-4" />
            送出
          </button>
        </form>
        <div className="mt-1 text-right text-[10px] text-slate-400">
          {input.length}/500 · Enter 送出
        </div>
      </div>
    </div>
  );
}

function Message({
  m,
  showHeader,
  canDelete,
  onDelete,
}: {
  m: Message;
  showHeader: boolean;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const time = new Date(m.createdAt).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  });

  return (
    <li className={`group flex gap-3 ${m.isSelf ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0">
        {showHeader ? (
          <div className="rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 p-1 dark:from-sky-900/40 dark:to-indigo-900/40">
            <AvatarPreview look={m.look} scale={2} animated={false} />
          </div>
        ) : (
          <div className="h-10 w-8" />
        )}
      </div>
      <div className={`min-w-0 flex-1 ${m.isSelf ? "items-end" : ""} flex flex-col`}>
        {showHeader && (
          <div className={`mb-0.5 flex items-baseline gap-2 ${m.isSelf ? "flex-row-reverse" : ""}`}>
            <span className="text-sm font-semibold text-slate-900">{m.authorName}</span>
            {m.authorDepartment && <span className="text-xs text-slate-400">{m.authorDepartment}</span>}
            <span className="text-xs text-slate-400">{time}</span>
          </div>
        )}
        <div className={`flex items-center gap-2 ${m.isSelf ? "flex-row-reverse" : ""}`}>
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
              m.isSelf
                ? "rounded-tr-md bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                : "rounded-tl-md bg-white/70 text-slate-900 dark:bg-slate-700/60 dark:text-slate-100"
            }`}
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {m.content}
          </div>
          {canDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 transition group-hover:opacity-100 text-slate-400 hover:text-rose-500"
              title="刪除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function mergeUnique(a: Message[], b: Message[]): Message[] {
  const seen = new Set(a.map((m) => m.id));
  return [...a, ...b.filter((m) => !seen.has(m.id))];
}

function timeDiffSec(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 1000;
}

function groupByDate(messages: Message[]): { date: string; items: Message[] }[] {
  const groups = new Map<string, Message[]>();
  for (const m of messages) {
    const date = new Date(m.createdAt).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Taipei",
    });
    const arr = groups.get(date) ?? [];
    arr.push(m);
    groups.set(date, arr);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}
