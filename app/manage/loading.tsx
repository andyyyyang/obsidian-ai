/**
 * /manage 底下任何 route 切換時立刻顯示的 skeleton。
 * 員工列表要算每人餘額 + pending count + 本月已用，初次 SSR 偏重；
 * 這個 fallback 讓切換 nav 的瞬間就有視覺反饋。
 */
export default function ManageLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div className="space-y-2">
        <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/40" />
        <div className="h-4 w-48 animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/30" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="glass-strong h-32 animate-pulse rounded-3xl p-5"
          />
        ))}
      </div>

      <div className="glass-strong animate-pulse rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-40 rounded-md bg-slate-200/70 dark:bg-slate-700/40" />
          <div className="h-8 w-28 rounded-xl bg-slate-200/60 dark:bg-slate-700/30" />
        </div>
        <div className="mb-4 h-10 rounded-2xl bg-slate-200/50 dark:bg-slate-700/30" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-200/40 dark:bg-slate-700/30" />
          ))}
        </div>
      </div>
    </main>
  );
}
