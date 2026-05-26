import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { GlassCard } from "@/components/glass-card";
import { AnnouncementForm } from "./announcement-form";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "MANAGER") redirect("/announcements");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/announcements" className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回公告列表
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">發佈公告</h1>

      <GlassCard variant="strong" className="p-6">
        <AnnouncementForm />
      </GlassCard>
    </main>
  );
}
