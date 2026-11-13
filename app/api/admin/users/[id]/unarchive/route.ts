import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/leave-actions";

export const dynamic = "force-dynamic";

/**
 * 取消歸檔 — 把員工還原到「已離職」狀態，重新出現在主列表。
 * active 仍為 false，要再點「恢復在職」才真正回來上班。
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, archivedAt: true },
  });
  if (!target) return NextResponse.json({ error: "員工不存在" }, { status: 404 });

  await prisma.user.update({
    where: { id },
    data: { archivedAt: null },
  });

  await logAudit(session.userId, "USER_UNARCHIVED", "User", id, { name: target.name });

  return NextResponse.json({ ok: true });
}
