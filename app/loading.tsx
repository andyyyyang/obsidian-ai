import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-strong flex items-center gap-3 rounded-2xl px-6 py-4">
        <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-ios-blue" />
        <span className="text-sm font-medium text-slate-700">載入中…</span>
      </div>
    </main>
  );
}
