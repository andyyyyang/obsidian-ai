import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Payslip } from "@/components/payslip";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

export default async function PayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const { id } = await params;
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: { user: { select: { name: true, employeeNo: true, department: true, jobTitle: true, email: true } } },
  });
  if (!payroll) notFound();

  const isAdmin = session.role === "ADMIN";
  if (payroll.userId !== session.userId && !isAdmin) {
    redirect("/payroll");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={isAdmin ? "/admin/payroll" : "/payroll"} className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <PrintButton />
      </div>

      <Payslip payroll={payroll} employee={payroll.user} />
    </main>
  );
}
