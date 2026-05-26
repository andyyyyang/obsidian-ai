import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { configToLook, deterministicLook } from "@/lib/avatar";

const postSchema = z.object({
  content: z.string().min(1).max(500),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);

  // since 用於增量輪詢
  const messages = await prisma.chatMessage.findMany({
    where: sinceParam
      ? { createdAt: { gt: new Date(sinceParam) } }
      : undefined,
    orderBy: { createdAt: sinceParam ? "asc" : "desc" },
    take: sinceParam ? undefined : limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          department: true,
          avatarConfig: true,
        },
      },
    },
  });

  const result = messages
    .map((m) => ({
      id: m.id,
      authorId: m.authorId,
      authorName: m.author.name,
      authorDepartment: m.author.department,
      isSelf: m.authorId === session.userId,
      look: m.author.avatarConfig
        ? configToLook(m.author.avatarConfig)
        : deterministicLook(m.authorId),
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // 一律由舊到新

  return NextResponse.json({ messages: result });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }
  const content = parsed.data.content.trim();
  if (!content) {
    return NextResponse.json({ error: "訊息不可為空" }, { status: 400 });
  }

  // 簡單防洗版：同一員工 2 秒內最多一則
  const recent = await prisma.chatMessage.findFirst({
    where: { authorId: session.userId, createdAt: { gt: new Date(Date.now() - 2000) } },
    select: { id: true },
  });
  if (recent) {
    return NextResponse.json({ error: "太快了，請稍等" }, { status: 429 });
  }

  const created = await prisma.chatMessage.create({
    data: { authorId: session.userId, content },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
