import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = { EMPLOYEE: "員工", MANAGER: "店長", ADMIN: "管理員" };

export default async function AdminEmployeesPage() {
  const users = await prisma.user.findMany({
    orderBy: { employeeNo: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="員工列表"
        subtitle={`共 ${users.length} 位`}
        action={
          <Link href="/admin/employees/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            新增員工
          </Link>
        }
      />
      <GlassCard variant="strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <Th>員編</Th>
                <Th>姓名</Th>
                <Th>角色</Th>
                <Th>職稱</Th>
                <Th>Email</Th>
                <Th>到職日</Th>
                <Th>狀態</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-white/40">
                  <Td>
                    <span className="font-medium text-slate-700">{u.employeeNo}</span>
                  </Td>
                  <Td>{u.name}</Td>
                  <Td>{roleLabels[u.role] ?? u.role}</Td>
                  <Td>{u.jobTitle ?? "—"}</Td>
                  <Td className="text-xs text-slate-500">{u.email}</Td>
                  <Td className="text-xs text-slate-500">{format(u.hireDate, "yyyy-MM-dd")}</Td>
                  <Td>
                    {u.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 在職
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> 離職
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Link href={`/admin/employees/${u.id}`} className="text-xs text-ios-blue hover:underline">
                      編輯
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 ${className}`}>{children}</td>;
}
