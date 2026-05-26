"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export function NewEmployeeForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    employeeNo: "",
    email: "",
    name: "",
    password: "",
    role: "EMPLOYEE",
    jobTitle: "",
    hireDate: new Date().toISOString().slice(0, 10),
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "新增失敗");
        return;
      }
      toast.success("已建立員工");
      router.push("/admin/employees");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="員工編號">
        <input className="input" required maxLength={20} value={form.employeeNo} onChange={(e) => update("employeeNo", e.target.value)} placeholder="例：S005" />
      </Field>
      <Field label="姓名">
        <input className="input" required maxLength={50} value={form.name} onChange={(e) => update("name", e.target.value)} />
      </Field>
      <Field label="Email">
        <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
      </Field>
      <Field label="初始密碼" hint="至少 8 字元，員工首次登入後請自行修改">
        <input className="input" type="text" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="角色">
          <select className="input" value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="EMPLOYEE">員工</option>
            <option value="MANAGER">店長</option>
            <option value="ADMIN">管理員</option>
          </select>
        </Field>
        <Field label="到職日">
          <input className="input" type="date" value={form.hireDate} onChange={(e) => update("hireDate", e.target.value)} />
        </Field>
      </div>
      <Field label="職稱" hint="廚師、外場、吧台…">
        <input className="input" maxLength={50} value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
      </Field>

      <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {pending ? "建立中…" : "建立員工"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
