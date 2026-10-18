import { NextResponse } from "next/server";
import { LeaveStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getBalance } from "@/lib/balance";

export const dynamic = "force-dynamic";

export type SubordinateRow = {
  id: string;
  employeeNo: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  department: string | null;
  jobTitle: string | null;
  employmentType: string;
  hireDate: string;
  active: boolean;
  annualLeaveEnabled: boolean;
  balance: {
    entitlement: number;
    adjustments: number;
    used: number;
    pending: number;
    remaining: number;
    yearStart: string | null;
    yearEnd: string | null;
    annualLeaveEnabled: boolean;
  };
  pendingCount: number;
  thisMonthUsed: number;
};

/**
 * 回傳當前主管/HR 可見的員工 + 每人即時餘額、本月已用天數、pending 件數。
 *
 * 一次把列表畫面要的所有欄位算好，避免 client 端 N 次呼叫 /api/me 打爆 DB。
 */
export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "MANAGER" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where = session.role === "ADMIN" ? {} : { managerId: session.userId };

  const subs = await prisma.user.findMany({
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
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const rows: SubordinateRow[] = await Promise.all(
    subs.map(async (u) => {
      const [bal, pendingCount, monthApproved] = await Promise.all([
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
        pendingCount,
        thisMonthUsed: monthApproved._sum.days ?? 0,
      };
    }),
  );

  return NextResponse.json({ rows });
}
