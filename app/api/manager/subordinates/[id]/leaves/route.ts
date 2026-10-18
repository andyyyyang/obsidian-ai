import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * 回傳指定員工最近 N 筆請假紀錄（含狀態）。
 * 權限：ADMIN 可看任何員工；MANAGER 只能看自己直屬。
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "MANAGER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, managerId: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role !== "ADMIN" && target.managerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const take = Math.min(parseInt(url.searchParams.get("take") ?? "20", 10) || 20, 100);

  const leaves = await prisma.leaveRequest.findMany({
    where: { requesterId: id },
    orderBy: { startDate: "desc" },
    take,
    select: {
      id: true,
      startDate: true,
      endDate: true,
      isHalfDay: true,
      halfDayPeriod: true,
      days: true,
      status: true,
      reason: true,
      createdAt: true,
      decidedAt: true,
    },
  });

  return NextResponse.json({
    leaves: leaves.map((l) => ({
      ...l,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      createdAt: l.createdAt.toISOString(),
      decidedAt: l.decidedAt?.toISOString() ?? null,
    })),
  });
}
