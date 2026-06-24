import { prisma } from "@/lib/prisma";
import { AnnouncementWidget } from "@/components/home-widgets";

export async function AnnouncementsWidgetServer() {
  const items = await prisma.announcement.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: 4,
    include: { author: { select: { name: true } } },
  });
  return (
    <AnnouncementWidget
      items={items.map((a) => ({
        id: a.id,
        title: a.title,
        authorName: a.author.name,
        publishedAt: a.publishedAt!,
        pinned: a.pinned,
      }))}
    />
  );
}
