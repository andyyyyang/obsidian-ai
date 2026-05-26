"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Props = {
  user: {
    id: string;
    employeeNo: string;
    email: string;
    name: string;
    role: string;
    jobTitle: string;
    active: boolean;
  };
};

export function EditEmployeeForm({ user }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    role: user.role,
    jobTitle: user.jobTitle,
    active: user.active,
    newPassword: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const payload: any = {
        name: form.name,
        role: form.role,
        jobTitle: form.jobTitle || null,
        active: form.active,
      };
      if (form.newPassword) {
        if (form.newPassword.length < 8) {
          toast.error("新密碼至少 8 字元");
          return;
        }
        payload.password = form.newPassword;
      }
      const res = await fetch(`/api/admin/employees/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "更新失敗");
        return;
      }
      toast.success("已儲存");
      router.refresh();
      if (form.newPassword) setForm({ ...form, newPassword: "" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
        員編 <span className="font-mono">{user.employeeNo}</span> · Email <span className="font-mono">{user.email}</span>
        <br />
        員編與 Email 不可修改；要換請刪除帳號重建。
      </div>

      <Field label="姓名">
        <input className="input" required maxLength={50} value={form.name} onChange={(e) => update("name", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="角色">
          <select className="input" value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="EMPLOYEE">員工</option>
            <option value="MANAGER">店長</option>
            <option value="ADMIN">管理員</option>
          </select>
        </Field>
        <Field label="狀態">
          <select className="input" value={form.active ? "1" : "0"} onChange={(e) => update("active", e.target.value === "1")}>
            <option value="1">在職</option>
            <option value="0">離職</option>
          </select>
        </Field>
      </div>

      <Field label="職稱">
        <input className="input" maxLength={50} value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
      </Field>

      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
          <KeyRound className="h-4 w-4" />
          重設密碼
        </div>
        <input
          className="input"
          type="text"
          minLength={8}
          placeholder="留空表示不修改"
          value={form.newPassword}
          onChange={(e) => update("newPassword", e.target.value)}
        />
        <p className="mt-1 text-xs text-amber-700">設定後會立刻生效，原密碼失效</p>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {pending ? "儲存中…" : "儲存變更"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
