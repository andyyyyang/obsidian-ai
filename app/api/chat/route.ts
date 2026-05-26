import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MAX_MESSAGE_LENGTH = 500;
const MAX_RETURNED = 60;

// 簡單記憶體 rate limit — 同一 user 每秒最多 1 則
const lastPostAt = new Map<string, number>();

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since"); // ISO timestamp 取之後的訊息
  const since = sinceParam ? new Date(sinceParam) : null;

  const messages = await prisma.chatMessage.findMany({
    where: since ? { createdAt: { gt: since } } : undefined,
    orderBy: { createdAt: "desc" },
    take: MAX_RETURNED,
    include: {
      author: { select: { id: true, name: true, employeeNo: true, role: true } },
    },
  });

  // 轉成由舊到新（前端 append 比較直覺）
  const sorted = messages.reverse();
  return NextResponse.json({
    messages: sorted.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      author: {
        id: m.author.id,
        name: m.author.name,
        employeeNo: m.author.employeeNo,
        role: m.author.role,
      },
      isSelf: m.author.id === session.userId,
    })),
  });
}

const postSchema = z.object({
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const last = lastPostAt.get(session.userId) ?? 0;
  if (Date.now() - last < 800) {
    return NextResponse.json({ error: "送太快，慢一點" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "訊息格式有誤" }, { status: 400 });
  }

  lastPostAt.set(session.userId, Date.now());

  const created = await prisma.chatMessage.create({
    data: {
      authorId: session.userId,
      content: parsed.data.content,
    },
    include: {
      author: { select: { id: true, name: true, employeeNo: true, role: true } },
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      author: {
        id: created.author.id,
        name: created.author.name,
        employeeNo: created.author.employeeNo,
        role: created.author.role,
      },
      isSelf: true,
    },
    { status: 201 },
  );
}
