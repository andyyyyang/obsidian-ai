import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { GlassCard } from "@/components/glass-card";
import { CorrectionForm } from "./correction-form";

export const dynamic = "force-dynamic";

export default async function NewCorrectionPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <Link href="/attendance" className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">補打卡申請</h1>
      <GlassCard variant="strong" className="p-6">
        <CorrectionForm />
      </GlassCard>
    </main>
  );
}
