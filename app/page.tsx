import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { format } from "date-fns";
import { BriefcaseBusiness, Calendar, CalendarCheck, ClipboardList, Clock, Gamepad2, Megaphone, MessageSquare, Receipt, Settings, Sparkles, User as UserIcon } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/balance";
import { yearProgress } from "@/lib/widgets";
import { LogoutButton } from "./logout-button";
import { GlassCard } from "@/components/glass-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { AvatarPreview } from "@/components/avatar-preview";
import { configToLook } from "@/lib/avatar";
import { YearProgress } from "@/components/year-progress";
import { WidgetSkeleton, RecentRequestsSkeleton } from "./_widgets/skeleton";
import { BirthdaysWidgetServer } from "./_widgets/birthdays";
import { AnniversariesWidgetServer } from "./_widgets/anniversaries";
import { UpcomingLeavesWidgetServer } from "./_widgets/upcoming-leaves";
import { AnnouncementsWidgetServer } from "./_widgets/announcements";
import { TodayShiftWidgetServer } from "./_widgets/today-shift";
import { RecentRequestsServer } from "./_widgets/recent-requests";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  // 只 fetch 立即要用的 user-specific 輕量資料，其他全部 stream
  const [user, balance] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        employeeNo: true,
        role: true,
        department: true,
        jobTitle: true,
        hireDate: true,
        employmentType: true,
        manager: { select: { name: true } },
        avatarConfig: true,
      },
    }),
    getBalance(session.userId),
  ]);
  if (!user) redirect("/login");

  const progress = balance.year ? yearProgress(balance.year.start, balance.year.end) : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/profile/avatar" className="group relative flex-shrink-0">
            <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 p-2 transition group-hover:scale-105 dark:from-sky-900/40 dark:to-indigo-900/40">
              <AvatarPreview look={configToLook(user.avatarConfig)} scale={2} />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow opacity-0 transition group-hover:opacity-100">
              <Sparkles className="h-3 w-3 text-amber-500" />
            </div>
          </Link>
          <div>
            <p className="text-sm text-slate-500">嗨，歡迎回來</p>
            <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-slate-900">{user.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {user.department} · {user.jobTitle} · 員編 {user.employeeNo}
              {user.manager ? ` · 主管 ${user.manager.name}` : ""}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink href="/office" icon={<Gamepad2 className="h-4 w-4 flex-shrink-0" />}>
            辦公室
          </NavLink>
          <NavLink href="/chat" icon={<MessageSquare className="h-4 w-4 flex-shrink-0" />}>
            聊天室
          </NavLink>
          <NavLink href="/announcements" icon={<Megaphone className="h-4 w-4 flex-shrink-0" />}>
            公告
          </NavLink>
          <NavLink href="/schedule" icon={<CalendarCheck className="h-4 w-4 flex-shrink-0" />}>
            班表
          </NavLink>
          <NavLink href="/profile/avatar" icon={<Sparkles className="h-4 w-4 flex-shrink-0" />}>
            角色
          </NavLink>
          <NavLink href="/clock" icon={<Clock className="h-4 w-4 flex-shrink-0" />}>
            打卡
          </NavLink>
          <NavLink href="/attendance" icon={<ClipboardList className="h-4 w-4 flex-shrink-0" />}>
            出勤
          </NavLink>
          <NavLink href="/payroll" icon={<Receipt className="h-4 w-4 flex-shrink-0" />}>
            薪資單
          </NavLink>
          <NavLink href="/calendar" icon={<Calendar className="h-4 w-4 flex-shrink-0" />}>
            行事曆
          </NavLink>
          {(user.role === "MANAGER" || user.role === "ADMIN") && (
            <NavLink href="/approvals" icon={<ClipboardList className="h-4 w-4 flex-shrink-0" />}>
              待審
            </NavLink>
          )}
          {(user.role === "MANAGER" || user.role === "ADMIN") && (
            <NavLink href="/manage" icon={<BriefcaseBusiness className="h-4 w-4 flex-shrink-0" />}>
              管理工具
            </NavLink>
          )}
          {user.role === "ADMIN" && (
            <NavLink href="/admin" icon={<Settings className="h-4 w-4 flex-shrink-0" />}>
              HR 後台
            </NavLink>
          )}
          <NavLink href="/profile" icon={<UserIcon className="h-4 w-4 flex-shrink-0" />}>
            個人手冊
          </NavLink>
          <ThemeToggle />
          <LogoutButton />
        </nav>
      </header>

      <GlassCard variant="strong" className="mb-6 p-7">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-slate-900">本年度特休</h2>
          {balance.year && (
            <span className="text-xs text-slate-500">
              週年度 {format(balance.year.start, "yyyy-MM-dd")} ~ {format(balance.year.end, "yyyy-MM-dd")}
            </span>
          )}
        </div>
        {!balance.annualLeaveEnabled ? (
          <p className="text-sm text-slate-500">
            您目前的職位（{employmentLabel(user.employmentType)}）不享有特休。
            <br />
            如有疑問請聯絡 HR。
          </p>
        ) : balance.year ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="法定天數" value={balance.entitlement} />
              <Stat label="已核准使用" value={balance.used} />
              <Stat label="申請中" value={balance.pending} />
              <Stat label="尚可申請" value={balance.remaining} emphasis />
            </div>
            <div className="mt-6">
              <YearProgress progress={progress} />
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            到職 {format(user.hireDate, "yyyy-MM-dd")}，尚未滿 6 個月，目前無法定特休。
          </p>
        )}
      </GlassCard>

      {/* widgets — 每個獨立 stream，慢的不會擋住快的 */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<WidgetSkeleton title="最新公告" />}>
          <AnnouncementsWidgetServer />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton title="今日班表" />}>
          <TodayShiftWidgetServer userId={user.id} />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton title="本週請假" />}>
          <UpcomingLeavesWidgetServer />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton title="即將生日" />}>
          <BirthdaysWidgetServer />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton title="即將週年" />}>
          <AnniversariesWidgetServer />
        </Suspense>
      </div>

      <Suspense fallback={<RecentRequestsSkeleton />}>
        <RecentRequestsServer userId={user.id} showNewButton={!!balance.year} />
      </Suspense>
    </main>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-ghost">
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}

function employmentLabel(t: string): string {
  return (
    { FULL_TIME: "正職", PART_TIME: "兼職", CONTRACT: "約聘", INTERN: "工讀 / 實習" }[t] ?? t
  );
}

function Stat({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={
          emphasis
            ? "mt-1 text-4xl font-bold text-gradient animate-soft-pulse"
            : "mt-1 text-4xl font-semibold text-slate-900"
        }
      >
        {value}
        <span className="ml-1 text-sm font-normal text-slate-400">天</span>
      </div>
    </div>
  );
}
