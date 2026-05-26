import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { configToLook, deterministicLook } from "@/lib/avatar";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { start, end } = tpeDayRange(tpeToday());

  // 撈今日所有打卡 + 當下角色設定
  const allPunches = await prisma.attendance.findMany({
    where: { punchedAt: { gte: start, lt: end } },
    orderBy: { punchedAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarConfig: true,
        },
      },
    },
  });

  // 依 user 聚合：最後狀態 (CLOCK_IN / CLOCK_OUT / BREAK_OUT / BREAK_IN)
  const stateByUser = new Map<string, { last: string; name: string; avatar: any }>();
  for (const p of allPunches) {
    stateByUser.set(p.userId, {
      last: p.type,
      name: p.user.name,
      avatar: p.user.avatarConfig,
    });
  }

  // 還沒打下班的就是「在辦公室」
  const online = Array.from(stateByUser.entries())
    .filter(([_, s]) => s.last !== "CLOCK_OUT")
    .map(([userId, s]) => ({
      id: userId,
      name: s.name,
      isSelf: userId === session.userId,
      onBreak: s.last === "BREAK_OUT",
      look: s.avatar ? configToLook(s.avatar) : deterministicLook(userId),
      statusMessage: s.avatar?.statusMessage ?? null,
    }));

  // 如果自己今天還沒打卡，也讓自己出現在辦公室裡（方便預覽）
  if (!online.find((o) => o.isSelf)) {
    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, avatarConfig: true },
    });
    if (me) {
      online.push({
        id: me.id,
        name: me.name,
        isSelf: true,
        onBreak: false,
        look: me.avatarConfig ? configToLook(me.avatarConfig) : deterministicLook(me.id),
        statusMessage: me.avatarConfig?.statusMessage ?? null,
      });
    }
  }

  return NextResponse.json({ occupants: online });
}
