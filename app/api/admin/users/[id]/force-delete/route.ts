import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/leave-actions";

export const dynamic = "force-dynamic";

/**
 * 強制永久刪除已歸檔員工 — 連同所有相關紀錄一起 cascade 清除。
 *
 * 前提：
 * - 必須已歸檔（archivedAt != null）才允許（避免誤刪）
 * - 不能是自己
 *
 * 會一併刪除 / 解除關聯：
 * - LeaveRequest（requester = 此人）→ 整張請假單刪掉
 * - LeaveRequest（approver = 此人）→ approverId 設 null，單子保留
 * - BalanceAdjustment / LeavePayout → 全刪
 * - 下屬（managerId = 此人）→ managerId 設 null，HR 需手動重指派
 * - AuditLog（actorId = 此人）→ 刪
 * - EmployeeProfile / EmploymentPeriod → onDelete:Cascade 自動
 * - User 本身 → 最後刪
 *
 * 全部在一個 transaction 裡完成。
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

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, archivedAt: true },
  });
  if (!target) return NextResponse.json({ error: "員工不存在" }, { status: 404 });
  if (!target.archivedAt) {
    return NextResponse.json(
      { error: "此員工未歸檔，無法永久刪除；請先歸檔" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.leaveRequest.updateMany({ where: { approverId: id }, data: { approverId: null } }),
    prisma.leaveRequest.deleteMany({ where: { requesterId: id } }),
    prisma.balanceAdjustment.deleteMany({ where: { userId: id } }),
    prisma.leavePayout.deleteMany({ where: { userId: id } }),
    prisma.user.updateMany({ where: { managerId: id }, data: { managerId: null } }),
    prisma.auditLog.deleteMany({ where: { actorId: id } }),
    // EmployeeProfile / EmploymentPeriod 走 onDelete:Cascade
    prisma.user.delete({ where: { id } }),
  ]);

  await logAudit(session.userId, "USER_FORCE_DELETED", "User", id, { name: target.name });

  return NextResponse.json({ ok: true });
}
