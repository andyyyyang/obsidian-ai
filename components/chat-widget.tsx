"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; employeeNo: string; role: string };
  isSelf: boolean;
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(async (sinceIso?: string) => {
    try {
      const url = sinceIso ? `/api/chat?since=${encodeURIComponent(sinceIso)}` : "/api/chat";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        if (sinceIso) {
          // append delta
          if (data.messages.length > 0) {
            setMessages((cur) => {
              const ids = new Set(cur.map((m) => m.id));
              const incoming = data.messages.filter((m: ChatMessage) => !ids.has(m.id));
              return [...cur, ...incoming];
            });
            // 廣播給場景，讓對應角色頭上冒泡
            for (const m of data.messages as ChatMessage[]) {
              window.dispatchEvent(
                new CustomEvent("chat:new", {
                  detail: { authorId: m.author.id, content: m.content },
                }),
              );
            }
            if (!open) setUnread((n) => n + data.messages.length);
          }
        } else {
          setMessages(data.messages);
        }
      }
    } catch {
      /* swallow */
    }
  }, [open]);

  // 初次 + 每 5 秒 poll 新訊息
  useEffect(() => {
    fetchMessages();
    const id = setInterval(() => {
      const last = messages[messages.length - 1];
      fetchMessages(last?.createdAt);
    }, 5_000);
    return () => clearInterval(id);
  }, [fetchMessages, messages]);

  // 開啟聊天時自動滑到底 + 清未讀
  useEffect(() => {
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [open, messages]);

  async function send() {
    const content = draft.trim();
    if (!content) return;
    if (content.length > 500) {
      toast.error("訊息超過 500 字");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "送出失敗");
        return;
      }
      setMessages((cur) => [...cur, data]);
      // 自己送的訊息也要在自己角色頭上冒泡
      window.dispatchEvent(
        new CustomEvent("chat:new", {
          detail: { authorId: data.author.id, content: data.content },
        }),
      );
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  function fmt(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: open
            ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
            : "linear-gradient(135deg, #f6b350 0%, #e87a2c 100%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3)",
          border: "2px solid #5a2510",
        }}
        aria-label="聊天室"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* 聊天面板 */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-3xl shadow-2xl sm:w-[380px]">
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{
              background: "linear-gradient(135deg, #f6b350 0%, #e87a2c 100%)",
              borderBottom: "2px solid #5a2510",
            }}
          >
            <div className="flex items-center gap-2 font-bold">
              <MessageCircle className="h-4 w-4" />
              店內聊天
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
            style={{ background: "linear-gradient(180deg, #fdf6e8 0%, #f5e9c8 100%)" }}
          >
            {messages.length === 0 ? (
              <p className="py-12 text-center text-xs text-amber-800/60">
                還沒有訊息 — 你來開第一句吧！
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.isSelf ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[82%]">
                    {/* 永遠顯示作者名，包含自己 */}
                    <div className={`mb-0.5 text-[11px] font-bold ${m.isSelf ? "text-right text-rose-700" : "text-amber-900"}`}>
                      {m.isSelf ? "我" : m.author.name}
                      {m.author.role !== "EMPLOYEE" && !m.isSelf && (
                        <span className="ml-1 rounded-sm bg-amber-200 px-1 text-[9px] text-amber-900">
                          {m.author.role === "ADMIN" ? "管理員" : "店長"}
                        </span>
                      )}
                      <span className="ml-1.5 text-[9px] font-normal text-amber-800/60">
                        {fmt(m.createdAt)}
                      </span>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-1.5 text-sm leading-snug"
                      style={
                        m.isSelf
                          ? {
                              background: "linear-gradient(135deg, #f6b350 0%, #e87a2c 100%)",
                              color: "#fff",
                              border: "1.5px solid #5a2510",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }
                          : {
                              background: "rgba(255,255,255,0.95)",
                              color: "#3a2515",
                              border: "1.5px solid rgba(139,90,43,0.4)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                            }
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 border-t-2 border-amber-900/20 bg-amber-50 p-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="輸入訊息…"
              maxLength={500}
              className="flex-1 rounded-xl border border-amber-900/30 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={sending || !draft.trim()}
              className="rounded-xl px-3 py-2 text-white shadow disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #f6b350 0%, #e87a2c 100%)",
                border: "1px solid #5a2510",
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
