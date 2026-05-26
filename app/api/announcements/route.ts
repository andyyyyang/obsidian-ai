import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(5000),
  pinned: z.boolean().default(false),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const publishedAt = parsed.data.publishedAt
    ? new Date(`${parsed.data.publishedAt}T00:00:00+08:00`)
    : new Date();

  const created = await prisma.announcement.create({
    data: {
      authorId: session.userId,
      title: parsed.data.title.trim(),
      content: parsed.data.content.trim(),
      pinned: parsed.data.pinned,
      publishedAt,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
