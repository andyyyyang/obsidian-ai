import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/leave-actions";

export const dynamic = "force-dynamic";

/**
 * 歸檔員工 — 必須先離職（active=false）。
 *
 * 歸檔後：
 * - 主列表預設不顯示（要把 filter 切到「已歸檔」才看得到）
 * - 紀錄完全保留，只是從日常視線移走
 * - HR 可以後續「取消歸檔」還原顯示，或「永久刪除」清除所有紀錄
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  if (id === session.userId) {
    return NextResponse.json({ error: "不能歸檔自己" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, active: true, archivedAt: true },
  });
  if (!target) return NextResponse.json({ error: "員工不存在" }, { status: 404 });

  if (target.active) {
    return NextResponse.json(
      { error: "請先辦理離職，才能歸檔" },
      { status: 400 },
    );
  }
  if (target.archivedAt) {
    return NextResponse.json({ ok: true, archivedAt: target.archivedAt }); // 已經歸檔，idempotent
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { archivedAt: new Date() },
    select: { id: true, archivedAt: true, name: true },
  });

  await logAudit(session.userId, "USER_ARCHIVED", "User", id, { name: target.name });

  return NextResponse.json({ ok: true, archivedAt: updated.archivedAt });
}
