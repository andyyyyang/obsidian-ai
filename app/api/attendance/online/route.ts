import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { configToLook, deterministicLook } from "@/lib/avatar";

// 過去多久內有 ping 視為「線上中」
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { start, end } = tpeDayRange(tpeToday());
  const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);

  // 1. 今日所有打卡 (拿最後狀態)
  const allPunches = await prisma.attendance.findMany({
    where: { punchedAt: { gte: start, lt: end } },
    orderBy: { punchedAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, avatarConfig: true, lastSeenAt: true, active: true },
      },
    },
  });

  type State = "CLOCK_IN" | "CLOCK_OUT" | "BREAK_OUT" | "BREAK_IN";
  const stateByUser = new Map<
    string,
    { last: State; name: string; avatar: any; lastSeenAt: Date | null; active: boolean }
  >();
  for (const p of allPunches) {
    stateByUser.set(p.userId, {
      last: p.type as State,
      name: p.user.name,
      avatar: p.user.avatarConfig,
      lastSeenAt: p.user.lastSeenAt,
      active: p.user.active,
    });
  }

  // 2. 「線上但今日未打卡」的員工
  const onlineUsers = await prisma.user.findMany({
    where: {
      active: true,
      lastSeenAt: { gte: onlineSince },
      id: { notIn: Array.from(stateByUser.keys()) },
    },
    select: { id: true, name: true, avatarConfig: true, lastSeenAt: true, active: true },
  });

  const occupants: Array<{
    id: string;
    name: string;
    isSelf: boolean;
    onBreak: boolean;
    onShift: boolean;        // 今日有打過上班且尚未下班
    online: boolean;         // 過去 5 分鐘有 ping
    look: ReturnType<typeof configToLook>;
    version: string;
    statusMessage: string | null;
  }> = [];

  // 推入已打卡（且未下班）的員工
  for (const [userId, s] of stateByUser) {
    if (s.last === "CLOCK_OUT") continue;
    const lookFromConfig = s.avatar ? configToLook(s.avatar) : deterministicLook(userId);
    occupants.push({
      id: userId,
      name: s.name,
      isSelf: userId === session.userId,
      onBreak: s.last === "BREAK_OUT",
      onShift: true,
      online: s.lastSeenAt ? s.lastSeenAt.getTime() >= onlineSince.getTime() : false,
      look: lookFromConfig,
      version: s.avatar?.version ?? "222",
      statusMessage: s.avatar?.statusMessage ?? null,
    });
  }

  // 推入線上但未打卡 (新需求：「登入員工出現在地圖上」)
  for (const u of onlineUsers) {
    const lookFromConfig = u.avatarConfig ? configToLook(u.avatarConfig) : deterministicLook(u.id);
    occupants.push({
      id: u.id,
      name: u.name,
      isSelf: u.id === session.userId,
      onBreak: false,
      onShift: false,
      online: true,
      look: lookFromConfig,
      version: u.avatarConfig?.version ?? "222",
      statusMessage: u.avatarConfig?.statusMessage ?? null,
    });
  }

  // 即使「我」連 ping 都還沒跑 (頁面剛載入), 也要在場景顯示我自己
  if (!occupants.find((o) => o.isSelf)) {
    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, avatarConfig: true },
    });
    if (me) {
      occupants.push({
        id: me.id,
        name: me.name,
        isSelf: true,
        onBreak: false,
        onShift: false,
        online: true,
        look: me.avatarConfig ? configToLook(me.avatarConfig) : deterministicLook(me.id),
        version: me.avatarConfig?.version ?? "222",
        statusMessage: me.avatarConfig?.statusMessage ?? null,
      });
    }
  }

  return NextResponse.json({ occupants });
}
