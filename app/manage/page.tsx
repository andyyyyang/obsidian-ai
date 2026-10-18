import Link from "next/link";
import { LeaveStatus } from "@prisma/client";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/balance";
import { GlassCard } from "@/components/glass-card";
import {
  CalendarPlusIcon,
  ClipboardListIcon,
  UserPlusIcon,
} from "@/components/icons/glass-icons";
import { SubordinatesList } from "./_components/subordinates-list";
import type { SubordinateRow } from "./_components/types";

export const dynamic = "force-dynamic";

export default async function ManageHome() {
  const session = await getSession();
  const isAdmin = session.role === "ADMIN";

  const where = isAdmin ? {} : { managerId: session.userId };

  const [subs, pendingCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { employeeNo: "asc" },
      select: {
        id: true,
        employeeNo: true,
        name: true,
        email: true,
        role: true,
        department: true,
        jobTitle: true,
        employmentType: true,
        hireDate: true,
        active: true,
        annualLeaveEnabled: true,
      },
    }),
    prisma.leaveRequest.count({
      where: {
        status: "PENDING",
        requester: isAdmin ? {} : { managerId: session.userId },
      },
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const rows: SubordinateRow[] = await Promise.all(
    subs.map(async (u) => {
      const [bal, pending, monthApproved] = await Promise.all([
        getBalance(u.id).catch(() => null),
        prisma.leaveRequest.count({
          where: { requesterId: u.id, status: LeaveStatus.PENDING },
        }),
        prisma.leaveRequest.aggregate({
          where: {
            requesterId: u.id,
            status: LeaveStatus.APPROVED,
            startDate: { gte: monthStart, lt: monthEnd },
          },
          _sum: { days: true },
        }),
      ]);
      return {
        id: u.id,
        employeeNo: u.employeeNo,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        jobTitle: u.jobTitle,
        employmentType: u.employmentType,
        hireDate: u.hireDate.toISOString(),
        active: u.active,
        annualLeaveEnabled: u.annualLeaveEnabled,
        balance: bal
          ? {
              entitlement: bal.entitlement,
              adjustments: bal.adjustments,
              used: bal.used,
              pending: bal.pending,
              remaining: bal.remaining,
              yearStart: bal.year?.start.toISOString() ?? null,
              yearEnd: bal.year?.end.toISOString() ?? null,
              annualLeaveEnabled: bal.annualLeaveEnabled,
            }
          : {
              entitlement: 0,
              adjustments: 0,
              used: 0,
              pending: 0,
              remaining: 0,
              yearStart: null,
              yearEnd: null,
              annualLeaveEnabled: u.annualLeaveEnabled,
            },
        pendingCount: pending,
        thisMonthUsed: monthApproved._sum.days ?? 0,
      };
    }),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">管理工具</h1>
      <p className="mb-8 text-sm text-slate-500">
        {isAdmin ? "HR 模式 — 你可管理所有員工" : "主管模式 — 你可管理直屬員工"}
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          href="/manage/users/new"
          icon={<UserPlusIcon className="h-5 w-5" />}
          title="新增員工"
          desc="建立新員工帳號（直接指派為你的屬下）"
          tone="blue"
        />
        <ActionCard
          href="/manage/backfill"
          icon={<CalendarPlusIcon className="h-5 w-5" />}
          title="補登請假"
          desc="將員工已經休過的特休登入系統"
          tone="purple"
        />
        <ActionCard
          href="/approvals"
          icon={<ClipboardListIcon className="h-5 w-5" />}
          title="待審申請"
          desc={`${pendingCount} 筆等待核准`}
          tone={pendingCount > 0 ? "amber" : "green"}
        />
      </div>

      <GlassCard variant="strong" className="p-5 md:p-6">
        <SubordinatesList initialRows={rows} isAdmin={isAdmin} />
      </GlassCard>
    </main>
  );
}

const tones = {
  blue: "bg-ios-blue/15 text-ios-blue",
  purple: "bg-ios-purple/15 text-ios-purple",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
};

function ActionCard({
  href,
  icon,
  title,
  desc,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: keyof typeof tones;
}) {
  return (
    <Link href={href}>
      <GlassCard variant="strong" hoverable className="p-5">
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}>
          {icon}
        </div>
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs text-slate-500">{desc}</div>
      </GlassCard>
    </Link>
  );
}
