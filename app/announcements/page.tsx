import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Megaphone, Pin, Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { AnnouncementCard } from "./announcement-card";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const isMod = session.role === "ADMIN" || session.role === "MANAGER";

  const announcements = await prisma.announcement.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    include: { author: { select: { id: true, name: true, department: true, jobTitle: true } } },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        {isMod && (
          <Link href="/announcements/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            新增公告
          </Link>
        )}
      </div>

      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Megaphone className="h-6 w-6 text-amber-500" />
          公司公告
        </h1>
        <p className="mt-1 text-sm text-slate-500">主管每週宣布事項與重要訊息</p>
      </header>

      {announcements.length === 0 ? (
        <GlassCard className="p-12 text-center text-sm text-slate-500">
          目前還沒有任何公告
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id}>
              <AnnouncementCard
                announcement={{
                  id: a.id,
                  title: a.title,
                  content: a.content,
                  pinned: a.pinned,
                  publishedAt: a.publishedAt.toISOString(),
                  authorId: a.authorId,
                  authorName: a.author.name,
                  authorJobTitle: a.author.jobTitle,
                }}
                canEdit={isMod || a.authorId === session.userId}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
