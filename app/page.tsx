import { redirect } from "next/navigation";
import Link from "next/link";
import { ChefHat, ClipboardList, LogOut, Settings, Sparkles, Utensils, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { configToLook, deterministicLook } from "@/lib/avatar";
import { GlassCard } from "@/components/glass-card";
import { AvatarPreview } from "@/components/avatar-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import { PunchCard } from "@/components/punch-card";
import { RestaurantView } from "./restaurant-view";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const { start, end } = tpeDayRange(tpeToday());

  const [me, restaurants, todayPunches, allTodayPunches] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        employeeNo: true,
        role: true,
        jobTitle: true,
        avatarConfig: true,
      },
    }),
    prisma.restaurant.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, latitude: true, longitude: true },
    }),
    prisma.attendance.findMany({
      where: { userId: session.userId, punchedAt: { gte: start, lt: end } },
      orderBy: { punchedAt: "asc" },
      include: { restaurant: { select: { name: true } } },
    }),
    prisma.attendance.findMany({
      where: { punchedAt: { gte: start, lt: end } },
      orderBy: { punchedAt: "asc" },
      include: { user: { select: { id: true, name: true, avatarConfig: true } } },
    }),
  ]);

  if (!me) redirect("/login");

  // 聚合每位員工今日的最後狀態（在崗 / 休息 / 已下班）
  const stateByUser = new Map<string, { last: string; name: string; avatar: any }>();
  for (const p of allTodayPunches) {
    stateByUser.set(p.userId, { last: p.type, name: p.user.name, avatar: p.user.avatarConfig });
  }
  const occupants = Array.from(stateByUser.entries())
    .filter(([_, s]) => s.last !== "CLOCK_OUT")
    .map(([userId, s]) => ({
      id: userId,
      name: s.name,
      isSelf: userId === session.userId,
      onBreak: s.last === "BREAK_OUT",
      look: s.avatar ? configToLook(s.avatar) : deterministicLook(userId),
      version: s.avatar?.version ?? "222",
      statusMessage: s.avatar?.statusMessage ?? null,
    }));

  // 即使還沒打卡，也讓自己出現在場景中讓使用者看到自己的角色
  if (!occupants.find((o) => o.isSelf)) {
    occupants.push({
      id: me.id,
      name: me.name,
      isSelf: true,
      onBreak: false,
      look: me.avatarConfig ? configToLook(me.avatarConfig) : deterministicLook(me.id),
      version: me.avatarConfig?.version ?? "222",
      statusMessage: me.avatarConfig?.statusMessage ?? null,
    });
  }

  const onShiftCount = Array.from(stateByUser.values()).filter((s) => s.last !== "CLOCK_OUT").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      {/* 頂部 header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/profile/avatar" className="group relative">
            <div className="flex h-[100px] w-[80px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 p-1 transition group-hover:scale-105 dark:from-amber-900/40 dark:to-rose-900/40">
              <AvatarPreview look={configToLook(me.avatarConfig)} version={me.avatarConfig?.version} resize={1} />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow opacity-0 transition group-hover:opacity-100">
              <Sparkles className="h-3 w-3 text-amber-500" />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {me.name}
              </h1>
              <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                {roleLabel(me.role)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {me.jobTitle ?? "員工"} · 員編 {me.employeeNo}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link href="/profile/avatar" className="btn-ghost">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">紙娃娃</span>
          </Link>
          <Link href="/attendance" className="btn-ghost">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">出勤紀錄</span>
          </Link>
          {(me.role === "ADMIN" || me.role === "MANAGER") && (
            <Link href="/admin" className="btn-ghost">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">後台</span>
            </Link>
          )}
          <ThemeToggle />
          <LogoutButton />
        </nav>
      </header>

      {/* 餐廳店招 */}
      <div className="mb-4 flex items-center justify-center gap-3 text-center">
        <div className="flex items-center gap-2 rounded-full bg-white/60 px-5 py-2 shadow-glass backdrop-blur-xl">
          <ChefHat className="h-5 w-5 text-amber-600" />
          <span className="font-bold tracking-wide text-slate-800">楓之谷餐廳</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-500">
            <Users className="mr-1 inline h-3 w-3" />
            在崗 {onShiftCount} 位
          </span>
        </div>
      </div>

      {/* 主版面：餐廳場景 + 打卡卡片 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <GlassCard variant="strong" className="overflow-hidden p-2">
          <RestaurantView initialOccupants={occupants} />
          <div className="mt-2 px-3 pb-1 text-center text-[11px] text-slate-500">
            場景每 20 秒自動更新同事狀態 · 黃色箭頭是你
          </div>
        </GlassCard>

        <div className="space-y-3">
          {restaurants.length === 0 ? (
            <GlassCard variant="strong" className="p-6 text-center text-sm text-amber-700">
              尚未建立任何分店<br />
              <Link href="/admin/restaurants" className="mt-2 inline-block text-ios-blue underline">
                請至後台新增
              </Link>
            </GlassCard>
          ) : (
            <PunchCard
              restaurants={restaurants.map((r) => ({ ...r }))}
              initialPunches={todayPunches.map((p) => ({
                id: p.id,
                type: p.type,
                punchedAt: p.punchedAt.toISOString(),
                restaurantName: p.restaurant?.name,
              }))}
              compact
            />
          )}

          {/* 小提示卡 */}
          <GlassCard variant="subtle" className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Utensils className="h-3.5 w-3.5" />
              小提示
            </div>
            <ul className="space-y-1 text-xs text-slate-600 marker:text-slate-300">
              <li>· 第一次來請先到「紙娃娃」打扮自己的角色</li>
              <li>· 上班前請允許瀏覽器定位，否則無法打卡</li>
              <li>· 短暫離崗請按「休息」，回來時記得「回崗」</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

function roleLabel(role: string): string {
  return { EMPLOYEE: "員工", MANAGER: "店長", ADMIN: "管理員" }[role] ?? role;
}
