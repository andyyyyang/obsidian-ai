"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

type Employee = { employeeNo: string; name: string };

export function ShiftImporter({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [publish, setPublish] = useState(true);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ imported: number; errors: { line: number; message: string }[] } | null>(null);

  function example() {
    // 自動產出本週示範資料
    const today = new Date();
    const tpeOffsetMin = 8 * 60;
    const tpe = new Date(today.getTime() + tpeOffsetMin * 60_000);
    const wd = tpe.getUTCDay();
    const mondayOffset = (wd + 6) % 7;
    const monday = new Date(tpe.getTime() - mondayOffset * 24 * 60 * 60_000);

    const lines: string[] = [
      "# 員編<TAB>日期<TAB>開始<TAB>結束<TAB>備註",
      "# 休假填 OFF，欄位之間用 TAB 或逗號",
    ];
    const sampleEmps = employees.slice(0, 3);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * 24 * 60 * 60_000);
      const dateStr = d.toISOString().slice(0, 10);
      sampleEmps.forEach((e, idx) => {
        const isOff = (i + idx) % 7 === 6;
        if (isOff) {
          lines.push(`${e.employeeNo}\t${dateStr}\tOFF\t\t休假`);
        } else {
          const start = idx === 0 ? "09:00" : idx === 1 ? "11:00" : "14:00";
          const end = idx === 0 ? "18:00" : idx === 1 ? "20:00" : "23:00";
          lines.push(`${e.employeeNo}\t${dateStr}\t${start}\t${end}\t`);
        }
      });
    }
    setRaw(lines.join("\n"));
  }

  function submit() {
    if (!raw.trim()) {
      toast.error("請貼上班表內容");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, publish }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) {
        toast.success(`已匯入 ${data.imported} 筆`);
        router.refresh();
      } else {
        toast.error(data.error ?? "匯入失敗");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <label className="font-medium text-slate-700">批次貼上班表 (TSV / CSV)</label>
          <button
            type="button"
            onClick={example}
            className="text-xs text-ios-blue hover:underline"
          >
            填示範資料
          </button>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`# 員編<TAB>日期<TAB>開始<TAB>結束<TAB>備註
S001\t2026-06-01\t09:00\t18:00\t早班
S002\t2026-06-01\t14:00\t23:00\t晚班
S003\t2026-06-01\tOFF\t\t休假`}
          rows={10}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 font-mono text-xs"
          style={{ fontFamily: "monospace" }}
        />
        <p className="mt-1 text-[11px] text-slate-500">
          每行一筆。欄位順序：員編 → 日期 (YYYY-MM-DD) → 開始 (HH:mm 或 OFF) → 結束 → 備註(選填)。
          TAB 或逗號分隔皆可。# 開頭視為註解。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          發佈後員工可見（不勾則僅存為草稿）
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn-primary"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          匯入
        </button>
      </div>

      {result && (
        <div
          className={`rounded-2xl p-3 text-xs ${
            result.errors.length === 0
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          <div className="font-bold">已匯入 {result.imported} 筆</div>
          {result.errors.length > 0 && (
            <>
              <div className="mt-1 font-medium">⚠ {result.errors.length} 筆失敗：</div>
              <ul className="ml-4 list-disc">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    第 {e.line} 行：{e.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
