"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, LogIn, User, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "登入失敗");
        return;
      }
      toast.success("登入成功，歡迎光臨！");
      router.replace("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900" htmlFor="email">
          <User className="h-3.5 w-3.5" />
          帳號 (Email)
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@maple.tw"
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            border: "2px solid #8b5a2b",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
            color: "#3a2515",
            fontFamily: "monospace",
          }}
        />
      </div>
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900" htmlFor="password">
          <KeyRound className="h-3.5 w-3.5" />
          密碼
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl px-4 py-2.5 text-sm transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            border: "2px solid #8b5a2b",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
            color: "#3a2515",
            fontFamily: "monospace",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="group relative mt-2 w-full overflow-hidden rounded-xl py-3 text-base font-black tracking-widest text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
        style={{
          background: "linear-gradient(180deg, #f6b350 0%, #e87a2c 50%, #c95220 100%)",
          border: "2px solid #5a2510",
          boxShadow: "0 6px 0 #5a2510, 0 8px 16px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.4)",
          textShadow: "1px 1px 0 #5a2510",
          fontFamily: "'Press Start 2P', 'PingFang TC', sans-serif",
          letterSpacing: "0.2em",
        }}
      >
        <span className="flex items-center justify-center gap-2">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
          {pending ? "登 入 中" : "進 入 餐 廳"}
        </span>
      </button>
    </form>
  );
}
