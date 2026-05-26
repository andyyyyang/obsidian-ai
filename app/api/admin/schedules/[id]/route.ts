import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await prisma.userSchedule.deleteMany({ where: { scheduleId: id } });
  await prisma.workSchedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
