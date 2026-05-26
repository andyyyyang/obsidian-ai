import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * 心跳 — 客戶端每 30 秒 ping 一次，更新 lastSeenAt
 * 用於「線上中」判定（過去 5 分鐘內有 ping 視為線上）
 */
export async function POST() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.user.update({
    where: { id: session.userId },
    data: { lastSeenAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
