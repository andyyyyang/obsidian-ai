import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { configToLook } from "@/lib/avatar";
import { GlassCard } from "@/components/glass-card";
import { AvatarEditor } from "@/components/avatar-editor";

export const dynamic = "force-dynamic";

export default async function AvatarPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { avatarConfig: true },
  });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="btn-ghost mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Sparkles className="h-6 w-6 text-amber-500" />
          打造你的辦公室角色
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          挑選髮型、服裝與配件，這就是你在辦公室畫面中的形象
        </p>
      </div>

      <GlassCard variant="strong" className="p-6">
        <AvatarEditor
          initialLook={configToLook(user.avatarConfig)}
          initialStatus={user.avatarConfig?.statusMessage ?? ""}
        />
      </GlassCard>

      <p className="mt-4 text-center text-xs text-slate-500">
        儲存後其他同事在辦公室畫面就會看到你的新外觀
      </p>
    </main>
  );
}
