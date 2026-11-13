/**
 * /admin 底下任何 route 切換時立刻顯示的 skeleton。
 * Next.js app router 會把這個檔案自動包成 Suspense fallback，
 * 使用者點 nav 的那一刻就看得到骨架，而不是白屏等 SSR 回來。
 */
export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div className="space-y-2">
        <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/40" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/30" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-strong h-28 animate-pulse rounded-3xl p-4 md:p-5"
          />
        ))}
      </div>

      <div className="glass-strong animate-pulse rounded-3xl p-6">
        <div className="mb-4 h-5 w-40 rounded-md bg-slate-200/70 dark:bg-slate-700/40" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-2xl bg-slate-200/50 dark:bg-slate-700/30" />
          ))}
        </div>
      </div>
    </main>
  );
}
