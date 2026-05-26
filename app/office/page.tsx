import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { configToLook, deterministicLook } from "@/lib/avatar";
import { GlassCard } from "@/components/glass-card";
import { OfficeView } from "./office-view";

export const dynamic = "force-dynamic";

export default async function OfficePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const { start, end } = tpeDayRange(tpeToday());
  const allPunches = await prisma.attendance.findMany({
    where: { punchedAt: { gte: start, lt: end } },
    orderBy: { punchedAt: "asc" },
    include: { user: { select: { id: true, name: true, avatarConfig: true } } },
  });

  const stateByUser = new Map<string, { last: string; name: string; avatar: any }>();
  for (const p of allPunches) {
    stateByUser.set(p.userId, { last: p.type, name: p.user.name, avatar: p.user.avatarConfig });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, avatarConfig: true },
  });

  const occupants = Array.from(stateByUser.entries())
    .filter(([_, s]) => s.last !== "CLOCK_OUT")
    .map(([userId, s]) => ({
      id: userId,
      name: s.name,
      isSelf: userId === session.userId,
      onBreak: s.last === "BREAK_OUT",
      look: s.avatar ? configToLook(s.avatar) : deterministicLook(userId),
      statusMessage: s.avatar?.statusMessage ?? null,
    }));

  if (me && !occupants.find((o) => o.isSelf)) {
    occupants.push({
      id: me.id,
      name: me.name,
      isSelf: true,
      onBreak: false,
      look: me.avatarConfig ? configToLook(me.avatarConfig) : deterministicLook(me.id),
      statusMessage: me.avatarConfig?.statusMessage ?? null,
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        <Link href="/profile/avatar" className="btn-primary">
          <Sparkles className="h-4 w-4" />
          編輯我的角色
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">虛擬辦公室</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          現在在辦公室：{occupants.length} 位
        </p>
      </div>

      <GlassCard variant="strong" className="overflow-hidden p-3">
        <OfficeView initialOccupants={occupants} />
      </GlassCard>

      <p className="mt-4 text-center text-xs text-slate-500">
        畫面每 20 秒自動更新一次同事狀態
      </p>
    </main>
  );
}
