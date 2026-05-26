import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// 刪除訊息：自己的訊息 or admin/manager
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const msg = await prisma.chatMessage.findUnique({ where: { id } });
  if (!msg) {
    return NextResponse.json({ error: "找不到訊息" }, { status: 404 });
  }
  const isOwner = msg.authorId === session.userId;
  const isMod = session.role === "ADMIN" || session.role === "MANAGER";
  if (!isOwner && !isMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.chatMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
