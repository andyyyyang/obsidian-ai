import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { GlassCard } from "@/components/glass-card";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/");
  }

  return (
    <>
      {/* 3D 動畫背景 — 鋪滿整個視窗，pointer-events-none */}
      <DottedSurface />

      {/* 中央徑向光暈，把焦點集中在登入卡 */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-1/2 top-1/2 -z-[5] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,rgba(94,92,230,0.35),transparent_70%)]",
          "dark:bg-[radial-gradient(ellipse_at_center,rgba(94,92,230,0.4),transparent_70%)]",
          "blur-[40px]",
        )}
      />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <GlassCard variant="strong" className="w-full max-w-xs p-7 animate-fade-in">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ios-blue to-ios-indigo shadow-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient">員工特休系統</h1>
            <p className="mt-1.5 text-xs text-slate-500">請以公司 Email 登入</p>
          </div>
          <LoginForm />
        </GlassCard>
      </main>
    </>
  );
}
