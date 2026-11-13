import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/leave-actions";

export const dynamic = "force-dynamic";

/**
 * 安全刪除員工 — 只有在該員工「沒有任何系統紀錄」時才允許。
 *
 * 可刪的前提：
 * - 沒有任何請假單（申請 / 核准 / 退回 / 取消都算）
 * - 沒有任何餘額調整紀錄
 * - 沒有任何折發紀錄
 * - 不是自己
 * - 不是別人的主管（會造成孤立）
 *
 * 任一條件不符就擋下來並回報原因，建議改用「辦理離職」。
 *
 * 用途：新建誤增的員工（填錯資料、重複建立）才會想真的刪掉；
 * 正常離職流程走 toggle-active（soft-delete）保留資料。
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  if (id === session.userId) {
    return NextResponse.json({ error: "不能刪除自己" }, { status: 400 });
  }

  const [leaveCount, adjustCount, payoutCount, subordinateCount, target] = await Promise.all([
    prisma.leaveRequest.count({ where: { requesterId: id } }),
    prisma.balanceAdjustment.count({ where: { userId: id } }),
    prisma.leavePayout.count({ where: { userId: id } }),
    prisma.user.count({ where: { managerId: id } }),
    prisma.user.findUnique({ where: { id }, select: { id: true, name: true } }),
  ]);

  if (!target) return NextResponse.json({ error: "員工不存在" }, { status: 404 });

  const blockers: string[] = [];
  if (leaveCount > 0) blockers.push(`${leaveCount} 筆請假紀錄`);
  if (adjustCount > 0) blockers.push(`${adjustCount} 筆餘額調整`);
  if (payoutCount > 0) blockers.push(`${payoutCount} 筆折發結算`);
  if (subordinateCount > 0) blockers.push(`${subordinateCount} 位下屬`);

  if (blockers.length > 0) {
    return NextResponse.json(
      {
        error: `此員工有 ${blockers.join("、")}，無法刪除。建議改用「辦理離職」保留紀錄。`,
        blockers,
      },
      { status: 409 },
    );
  }

  // 連帶把 profile / employmentPeriod / auditLogs (寫到此人的) 一併清掉
  await prisma.$transaction([
    prisma.employeeProfile.deleteMany({ where: { userId: id } }),
    prisma.employmentPeriod.deleteMany({ where: { userId: id } }),
    prisma.auditLog.deleteMany({ where: { actorId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  await logAudit(session.userId, "USER_DELETED", "User", id, { name: target.name });

  return NextResponse.json({ ok: true });
}
