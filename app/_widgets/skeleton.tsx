import { GlassCard } from "@/components/glass-card";

export function WidgetSkeleton({ title }: { title?: string }) {
  return (
    <GlassCard variant="strong" className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="skeleton h-7 w-7 rounded-xl" />
        {title ? (
          <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
        ) : (
          <span className="skeleton h-4 w-20 rounded" />
        )}
      </div>
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="skeleton h-7 w-7 rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <span className="skeleton block h-3 w-3/5 rounded" />
              <span className="skeleton block h-2.5 w-2/5 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export function RecentRequestsSkeleton() {
  return (
    <GlassCard variant="strong" className="p-7">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-500">最近的申請</h2>
        <span className="skeleton h-9 w-24 rounded-2xl" />
      </div>
      <ul className="space-y-2">
        {[1, 2, 3].map((i) => (
          <li key={i} className="glass-subtle rounded-2xl px-4 py-3.5">
            <div className="space-y-2">
              <span className="skeleton block h-4 w-2/3 rounded" />
              <span className="skeleton block h-3 w-1/2 rounded" />
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
