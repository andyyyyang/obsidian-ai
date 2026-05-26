import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";
import { EditEmployeeForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <PageHeader
        title={`編輯 ${user.name}`}
        subtitle={`員編 ${user.employeeNo} · 到職 ${format(user.hireDate, "yyyy-MM-dd")}`}
        back={{ href: "/admin/employees", label: "回員工列表" }}
      />
      <GlassCard variant="strong" className="p-6 md:p-8">
        <EditEmployeeForm
          user={{
            id: user.id,
            employeeNo: user.employeeNo,
            email: user.email,
            name: user.name,
            role: user.role,
            jobTitle: user.jobTitle ?? "",
            active: user.active,
          }}
        />
      </GlassCard>
    </main>
  );
}
