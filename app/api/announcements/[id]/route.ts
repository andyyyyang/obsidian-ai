import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  content: z.string().min(1).max(5000).optional(),
  pinned: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) return NextResponse.json({ error: "找不到" }, { status: 404 });
  const isMod = session.role === "ADMIN" || session.role === "MANAGER";
  const isAuthor = ann.authorId === session.userId;
  if (!isMod && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }
  await prisma.announcement.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) return NextResponse.json({ error: "找不到" }, { status: 404 });
  const isMod = session.role === "ADMIN" || session.role === "MANAGER";
  const isAuthor = ann.authorId === session.userId;
  if (!isMod && !isAuthor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
