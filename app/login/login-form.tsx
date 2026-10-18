"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  // 進頁面立刻 prewarm — 讓 serverless function + Prisma + Postgres 連線
  // 在使用者打字時就建好，按下登入時 bcrypt.compare 可以馬上開始。
  useEffect(() => {
    fetch("/api/auth/warm").catch(() => {});
  }, []);

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
        setPending(false);
        return;
      }
      // 立刻停掉「登入中…」spinner，讓 loading.tsx 接手顯示
      setPending(false);
      // Next.js soft navigation → 馬上觸發 app/loading.tsx 顯示 skeleton
      router.replace("/");
      router.refresh();
    } catch (err) {
      toast.error("網路錯誤，請重試");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="password">
          密碼
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="••••••••"
        />
      </div>
      <SubmitButton
        pending={pending}
        loadingText="登入中…"
        icon={<LogIn className="h-4 w-4" />}
        size="lg"
        fullWidth
      >
        登入
      </SubmitButton>
    </form>
  );
}
