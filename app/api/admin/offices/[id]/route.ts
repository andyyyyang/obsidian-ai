import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.office.delete({ where: { id } });
  } catch {
    // 若有外鍵關聯（如打卡紀錄），改成停用
    await prisma.office.update({ where: { id }, data: { active: false } });
  }
  return NextResponse.json({ ok: true });
}
