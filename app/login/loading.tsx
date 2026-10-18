/**
 * Login 專用 skeleton — cold start / 導航中立刻顯示，不會是白屏。
 * 跟真正的 LoginForm 卡片同尺寸，減少 layout shift。
 */
export default function LoginLoading() {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong w-full max-w-xs animate-fade-in rounded-3xl p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-ios-blue/40 to-ios-indigo/40" />
          <div className="h-6 w-32 animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-700/40" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/30" />
        </div>
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 h-4 w-10 animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/40" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100/80 dark:bg-slate-800/40" />
          </div>
          <div>
            <div className="mb-1.5 h-4 w-10 animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/40" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100/80 dark:bg-slate-800/40" />
          </div>
          <div className="h-11 animate-pulse rounded-xl bg-gradient-to-r from-ios-blue/40 to-ios-indigo/40" />
        </div>
      </div>
    </main>
  );
}
