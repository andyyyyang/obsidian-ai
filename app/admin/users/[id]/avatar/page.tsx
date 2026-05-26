import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { configToLook } from "@/lib/avatar";
import { GlassCard } from "@/components/glass-card";
import { AvatarEditor } from "@/components/avatar-editor";

export const dynamic = "force-dynamic";

export default async function AdminAvatarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { avatarConfig: true },
  });
  if (!user) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href={`/admin/users/${id}`} className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回員工資料
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{user.name} 的角色設定</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.employeeNo} · 由 HR 為員工預設外觀，員工日後可自行修改
        </p>
      </div>

      <GlassCard variant="strong" className="p-6">
        <AvatarEditor
          targetUserId={id}
          initialLook={configToLook(user.avatarConfig)}
          initialStatus={user.avatarConfig?.statusMessage ?? ""}
        />
      </GlassCard>
    </main>
  );
}
