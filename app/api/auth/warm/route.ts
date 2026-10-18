import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Prewarm endpoint — 讓登入頁一打開就先把 Prisma + Postgres connection pool
 * 建起來，使用者按下登入時連線已熱，大幅縮短第一次登入的等待時間。
 *
 * 回傳體積刻意最小，不洩漏任何內部資訊；呼叫失敗不影響登入流程。
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // 熱身失敗就靜默吞掉，真正的錯誤留給 login API 自己處理
  }
  return NextResponse.json({ ok: true });
}
