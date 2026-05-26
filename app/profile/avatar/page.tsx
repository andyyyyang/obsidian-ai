import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { configToLook } from "@/lib/avatar";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";
import { AvatarEditor } from "@/components/avatar-editor";

export const dynamic = "force-dynamic";

export default async function AvatarPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, avatarConfig: true },
  });
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <PageHeader
        title="角色紙娃娃"
        subtitle={`打扮 ${user.name} 在餐廳裡的模樣，存檔後場景會自動更新`}
        back={{ href: "/", label: "回餐廳" }}
      />
      <GlassCard variant="strong" className="p-6 md:p-8">
        <AvatarEditor
          initialLook={configToLook(user.avatarConfig)}
          initialStatus={user.avatarConfig?.statusMessage ?? ""}
        />
      </GlassCard>
    </main>
  );
}
