import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";
import { NewEmployeeForm } from "./new-employee-form";

export default function NewEmployeePage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <PageHeader title="新增員工" back={{ href: "/admin/employees", label: "回員工列表" }} />
      <GlassCard variant="strong" className="p-6 md:p-8">
        <NewEmployeeForm />
      </GlassCard>
    </main>
  );
}
