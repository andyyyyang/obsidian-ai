"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/submit-button";
import type { SubordinateRow } from "./types";

/**
 * 不開到 /admin/users/{id} 完整編輯頁，直接改最常動的三欄：
 * 部門、職稱、雇用類型。走既有 PATCH /api/admin/users/[id]。
 */
export function QuickEditDialog({
  row,
  onClose,
  onPatched,
}: {
  row: SubordinateRow;
  onClose: () => void;
  onPatched: (patch: Partial<SubordinateRow>) => void;
}) {
  const [department, setDepartment] = useState(row.department ?? "");
  const [jobTitle, setJobTitle] = useState(row.jobTitle ?? "");
  const [employmentType, setEmploymentType] = useState(row.employmentType);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const body: Record<string, unknown> = {};
      if ((department || null) !== (row.department ?? null)) body.department = department || null;
      if ((jobTitle || null) !== (row.jobTitle ?? null)) body.jobTitle = jobTitle || null;
      if (employmentType !== row.employmentType) body.employmentType = employmentType;

      if (Object.keys(body).length === 0) {
        toast("沒有變更");
        onClose();
        return;
      }

      const res = await fetch(`/api/admin/users/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "更新失敗");
        return;
      }
      toast.success("已更新");
      onPatched({
        department: body.department !== undefined ? (body.department as string | null) : row.department,
        jobTitle: body.jobTitle !== undefined ? (body.jobTitle as string | null) : row.jobTitle,
        employmentType: (body.employmentType as string | undefined) ?? row.employmentType,
      });
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open onClose={onClose} variant="center" maxWidth="sm">
      <DialogHeader
        icon={<Pencil className="h-5 w-5 text-ios-indigo" />}
        title={`快速修正 ${row.name}`}
        subtitle={`員編 ${row.employeeNo} · 完整編輯請用「編輯資料」`}
        onClose={onClose}
      />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            部門
          </label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="例如：文化店"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            職稱
          </label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="例如：店長"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            雇用類型
          </label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="input"
          >
            <option value="FULL_TIME">正職</option>
            <option value="PART_TIME">兼職</option>
            <option value="CONTRACT">約聘</option>
            <option value="INTERN">工讀 / 實習</option>
          </select>
        </div>
        <div className="flex justify-end">
          <SubmitButton pending={pending} loadingText="送出中…">
            確認更新
          </SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
