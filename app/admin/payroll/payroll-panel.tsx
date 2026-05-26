"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Play, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass-card";
import { ntd } from "@/lib/payroll";

type Row = {
  id: string;
  name: string;
  employeeNo: string;
  department: string | null;
  hasSalary: boolean;
  salaryAmount: number | null;
  salaryType: string | null;
  payroll: { id: string; netPay: number; generatedAt: string } | null;
};

const SALARY_LABEL: Record<string, string> = {
  MONTHLY: "月薪",
  HOURLY: "時薪",
  DAILY: "日薪",
};

export function PayrollPanel({ year, month, users }: { year: number; month: number; users: Row[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function selectAll() {
    if (selected.size === users.filter((u) => u.hasSalary).length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.filter((u) => u.hasSalary).map((u) => u.id)));
    }
  }

  function generate(overwrite: boolean) {
    if (selected.size === 0) {
      toast.error("請先選擇員工");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: Array.from(selected),
          year,
          month,
          overwrite,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "失敗");
        return;
      }
      const ok = data.results.filter((r: any) => r.status !== "error" && r.status !== "skipped (already exists)").length;
      const errs = data.results.filter((r: any) => r.status === "error").length;
      const skipped = data.results.filter((r: any) => r.status === "skipped (already exists)").length;
      toast.success(`完成：成功 ${ok} 筆${skipped ? `，略過 ${skipped} 筆` : ""}${errs ? `，失敗 ${errs} 筆` : ""}`);
      setSelected(new Set());
      router.refresh();
    });
  }

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`?year=${prev.y}&month=${prev.m}`} className="btn-ghost">←</Link>
          <span className="text-lg font-semibold tabular-nums">{year} / {String(month).padStart(2, "0")}</span>
          <Link href={`?year=${next.y}&month=${next.m}`} className="btn-ghost">→</Link>
        </div>
        <div className="flex gap-2">
          <button onClick={() => generate(false)} disabled={pending || selected.size === 0} className="btn-primary">
            <Play className="h-4 w-4" />
            產生薪資單（{selected.size}）
          </button>
          <button onClick={() => generate(true)} disabled={pending || selected.size === 0} className="btn-ghost">
            <RefreshCw className="h-4 w-4" />
            重新產生（覆寫）
          </button>
        </div>
      </div>

      <GlassCard variant="strong" className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size > 0 && selected.size === users.filter((u) => u.hasSalary).length}
                  onChange={selectAll}
                />
              </th>
              <th className="px-3 py-3">員工</th>
              <th className="px-3 py-3">部門</th>
              <th className="px-3 py-3">薪資設定</th>
              <th className="px-3 py-3">本月狀態</th>
              <th className="px-3 py-3 text-right">實領</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    disabled={!u.hasSalary}
                    onChange={() => toggle(u.id)}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.employeeNo}</div>
                </td>
                <td className="px-3 py-3 text-slate-600">{u.department ?? "—"}</td>
                <td className="px-3 py-3 text-slate-600">
                  {u.hasSalary ? (
                    <span>{SALARY_LABEL[u.salaryType!]} {ntd(u.salaryAmount!)}</span>
                  ) : (
                    <span className="text-rose-500">未設定</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {u.payroll ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      已產生
                    </span>
                  ) : (
                    <span className="text-slate-400">未產生</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {u.payroll ? ntd(u.payroll.netPay) : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  {u.payroll && (
                    <Link href={`/payroll/${u.payroll.id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <Printer className="h-3.5 w-3.5" />
                      檢視
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                  沒有員工資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </>
  );
}
