import { addDays, differenceInCalendarDays, isWithinInterval, startOfDay } from "date-fns";
import { LeaveStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UpcomingBirthday = {
  userId: string;
  name: string;
  department: string | null;
  date: Date; // 今年的生日
  daysAway: number;
};

export type UpcomingAnniversary = {
  userId: string;
  name: string;
  department: string | null;
  years: number;
  date: Date; // 今年的週年日
  daysAway: number;
};

export type UpcomingLeave = {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  days: number;
  isHalfDay: boolean;
};

/** 找出任意日期區間內每個人在該段時間發生的生日（含今年、跨年都會展開） */
export async function getBirthdaysInRange(from: Date, to: Date): Promise<UpcomingBirthday[]> {
  const fromDay = startOfDay(from);
  const toDay = startOfDay(to);
  const profiles = await prisma.employeeProfile.findMany({
    where: { birthDate: { not: null } },
    include: {
      user: { select: { id: true, name: true, department: true, active: true } },
    },
  });

  const results: UpcomingBirthday[] = [];
  for (const p of profiles) {
    if (!p.birthDate || !p.user.active) continue;
    const bd = new Date(p.birthDate);
    // 走過 from~to 跨越的所有年份
    for (let y = fromDay.getFullYear(); y <= toDay.getFullYear(); y++) {
      const target = new Date(y, bd.getMonth(), bd.getDate());
      if (isWithinInterval(target, { start: fromDay, end: toDay })) {
        results.push({
          userId: p.user.id,
          name: p.user.name,
          department: p.user.department,
          date: target,
          daysAway: differenceInCalendarDays(target, fromDay),
        });
      }
    }
  }
  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** 找出任意日期區間內每個人在該段時間發生的週年（已滿 1 年以上） */
export async function getAnniversariesInRange(
  from: Date,
  to: Date,
): Promise<UpcomingAnniversary[]> {
  const fromDay = startOfDay(from);
  const toDay = startOfDay(to);
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, department: true, hireDate: true },
  });

  const results: UpcomingAnniversary[] = [];
  for (const u of users) {
    const hire = new Date(u.hireDate);
    for (let y = fromDay.getFullYear(); y <= toDay.getFullYear(); y++) {
      const target = new Date(y, hire.getMonth(), hire.getDate());
      const years = target.getFullYear() - hire.getFullYear();
      if (years < 1) continue;
      if (isWithinInterval(target, { start: fromDay, end: toDay })) {
        results.push({
          userId: u.id,
          name: u.name,
          department: u.department,
          years,
          date: target,
          daysAway: differenceInCalendarDays(target, fromDay),
        });
      }
    }
  }
  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** 找出未來 windowDays 天內的生日 — thin wrapper */
export async function getUpcomingBirthdays(windowDays = 14): Promise<UpcomingBirthday[]> {
  const today = startOfDay(new Date());
  return getBirthdaysInRange(today, addDays(today, windowDays));
}

/** 找出未來 windowDays 天內的週年 — thin wrapper */
export async function getUpcomingAnniversaries(windowDays = 14): Promise<UpcomingAnniversary[]> {
  const today = startOfDay(new Date());
  return getAnniversariesInRange(today, addDays(today, windowDays));
}

/** 找出未來 windowDays 天內已核准的請假（含今天） */
export async function getUpcomingLeaves(windowDays = 7): Promise<UpcomingLeave[]> {
  const today = startOfDay(new Date());
  const end = addDays(today, windowDays);

  const requests = await prisma.leaveRequest.findMany({
    where: {
      status: LeaveStatus.APPROVED,
      AND: [{ endDate: { gte: today } }, { startDate: { lte: end } }],
    },
    include: { requester: { select: { id: true, name: true } } },
    orderBy: { startDate: "asc" },
  });

  return requests.map((r) => ({
    id: r.id,
    userId: r.requester.id,
    name: r.requester.name,
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    isHalfDay: r.isHalfDay,
  }));
}

/** 個人的「本年度進度」— 你在當前週年度過了多少天 */
export function yearProgress(yearStart: Date, yearEnd: Date, asOf: Date = new Date()): number {
  const total = differenceInCalendarDays(yearEnd, yearStart) + 1;
  const elapsed = Math.max(0, Math.min(total, differenceInCalendarDays(asOf, yearStart)));
  return Math.round((elapsed / total) * 100);
}
