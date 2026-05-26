/**
 * 出勤統計核心：將打卡紀錄聚合為每日工時、遲到、缺勤等。
 */

import type { Attendance, WorkSchedule } from "@prisma/client";
import { prisma } from "./prisma";
import { tpeDateString, tpeMonthRange, tpeWeekday, tpeToUtc } from "./tz";

export type DailySummary = {
  date: string;                  // "YYYY-MM-DD" (台北)
  weekday: number;               // 0-6
  isWorkday: boolean;            // 班別應該上班
  clockIn?: Date;
  clockOut?: Date;
  workMinutes: number;           // 上下班總時長 - 外出 - 午休
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  hasLeave: boolean;             // 該日有請假（含半天）
  leaveDays: number;             // 0 / 0.5 / 1
  status: DayStatus;
};

export type DayStatus =
  | "ON_TIME"        // 正常出勤
  | "LATE"           // 遲到
  | "EARLY_LEAVE"    // 早退
  | "INCOMPLETE"     // 漏打卡（只有上班或只有下班）
  | "ABSENT"         // 缺勤（該上班但完全沒打卡且無請假）
  | "LEAVE"          // 整日請假
  | "HALF_LEAVE"     // 半天假
  | "OFF"            // 休假日
  | "FUTURE";        // 未到日期

/** workDays bitfield 對照：bit0=週日, bit6=週六 */
export function isScheduledWorkday(schedule: WorkSchedule, weekday: number): boolean {
  return (schedule.workDays & (1 << weekday)) !== 0;
}

/** 取得員工於某日生效的班別（找最近的 effectiveFrom <= date 且 effectiveTo > date 或 null） */
export async function getEffectiveSchedule(userId: string, date: Date): Promise<WorkSchedule | null> {
  const assignment = await prisma.userSchedule.findFirst({
    where: {
      userId,
      effectiveFrom: { lte: date },
      OR: [{ effectiveTo: null }, { effectiveTo: { gt: date } }],
    },
    orderBy: { effectiveFrom: "desc" },
    include: { schedule: true },
  });
  return assignment?.schedule ?? null;
}

/** 聚合一天的打卡：取最早 CLOCK_IN、最晚 CLOCK_OUT、累積外出時長 */
function aggregateDay(punches: Attendance[]): {
  clockIn?: Date;
  clockOut?: Date;
  breakMinutes: number;
} {
  const sorted = [...punches].sort((a, b) => a.punchedAt.getTime() - b.punchedAt.getTime());
  let clockIn: Date | undefined;
  let clockOut: Date | undefined;
  let breakMinutes = 0;
  let breakStart: Date | undefined;

  for (const p of sorted) {
    if (p.type === "CLOCK_IN" && !clockIn) clockIn = p.punchedAt;
    if (p.type === "CLOCK_OUT") clockOut = p.punchedAt;  // 取最後一次
    if (p.type === "BREAK_OUT") breakStart = p.punchedAt;
    if (p.type === "BREAK_IN" && breakStart) {
      breakMinutes += Math.max(
        0,
        Math.round((p.punchedAt.getTime() - breakStart.getTime()) / 60_000),
      );
      breakStart = undefined;
    }
  }
  return { clockIn, clockOut, breakMinutes };
}

/**
 * 產生某員工某月的每日彙總。
 * 需要傳入該月所有打卡與請假紀錄，函式本身不查 DB（方便測試與重用）。
 */
export function buildMonthlySummary(params: {
  year: number;
  month: number;
  schedule: WorkSchedule | null;
  punches: Attendance[];
  leaves: Array<{ startDate: Date; endDate: Date; days: number; isHalfDay: boolean }>;
  now?: Date;
}): DailySummary[] {
  const { year, month, schedule, punches, leaves } = params;
  const now = params.now ?? new Date();
  const { start, end } = tpeMonthRange(year, month);

  // 依日分組打卡
  const punchesByDate = new Map<string, Attendance[]>();
  for (const p of punches) {
    const dateStr = tpeDateString(p.punchedAt);
    const arr = punchesByDate.get(dateStr) ?? [];
    arr.push(p);
    punchesByDate.set(dateStr, arr);
  }

  // 請假覆蓋：date -> {leaveDays, isHalfDay}
  const leaveByDate = new Map<string, { days: number; isHalfDay: boolean }>();
  for (const lv of leaves) {
    const lvStart = lv.startDate;
    const lvEnd = lv.endDate;
    let cursor = new Date(lvStart);
    while (cursor <= lvEnd) {
      const ds = tpeDateString(cursor);
      const portion = lv.isHalfDay ? 0.5 : 1;
      const existing = leaveByDate.get(ds);
      leaveByDate.set(ds, {
        days: Math.min(1, (existing?.days ?? 0) + portion),
        isHalfDay: lv.isHalfDay,
      });
      cursor = new Date(cursor.getTime() + 24 * 60 * 60_000);
    }
  }

  const summaries: DailySummary[] = [];
  let cursor = new Date(start);
  while (cursor < end) {
    const dateStr = tpeDateString(cursor);
    const weekday = tpeWeekday(cursor);
    const dayPunches = punchesByDate.get(dateStr) ?? [];
    const leave = leaveByDate.get(dateStr);
    const isScheduled = schedule ? isScheduledWorkday(schedule, weekday) : weekday >= 1 && weekday <= 5;

    const { clockIn, clockOut, breakMinutes } = aggregateDay(dayPunches);

    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let overtimeMinutes = 0;
    let workMinutes = 0;

    if (schedule && isScheduled && (clockIn || clockOut)) {
      const startUtc = tpeToUtc(dateStr, schedule.startTime);
      const endUtc = tpeToUtc(dateStr, schedule.endTime);
      if (clockIn) {
        const lateMs = clockIn.getTime() - startUtc.getTime();
        if (lateMs > schedule.lateGraceMinutes * 60_000) {
          lateMinutes = Math.ceil(lateMs / 60_000);
        }
      }
      if (clockOut) {
        const earlyMs = endUtc.getTime() - clockOut.getTime();
        if (earlyMs > 0) earlyLeaveMinutes = Math.ceil(earlyMs / 60_000);
        const overtimeMs = clockOut.getTime() - endUtc.getTime();
        if (overtimeMs > 0) overtimeMinutes = Math.floor(overtimeMs / 60_000);
      }
      if (clockIn && clockOut) {
        const total = Math.max(0, Math.round((clockOut.getTime() - clockIn.getTime()) / 60_000));
        workMinutes = Math.max(0, total - breakMinutes - schedule.breakMinutes);
      }
    } else if (clockIn && clockOut) {
      const total = Math.max(0, Math.round((clockOut.getTime() - clockIn.getTime()) / 60_000));
      workMinutes = Math.max(0, total - breakMinutes);
    }

    let status: DayStatus;
    const isFuture = cursor > now;
    if (isFuture) {
      status = "FUTURE";
    } else if (!isScheduled) {
      status = "OFF";
    } else if (leave && leave.days >= 1) {
      status = "LEAVE";
    } else if (leave && leave.days > 0) {
      status = "HALF_LEAVE";
    } else if (!clockIn && !clockOut) {
      status = "ABSENT";
    } else if (!clockIn || !clockOut) {
      status = "INCOMPLETE";
    } else if (lateMinutes > 0) {
      status = "LATE";
    } else if (earlyLeaveMinutes > 0) {
      status = "EARLY_LEAVE";
    } else {
      status = "ON_TIME";
    }

    summaries.push({
      date: dateStr,
      weekday,
      isWorkday: isScheduled,
      clockIn,
      clockOut,
      workMinutes,
      lateMinutes,
      earlyLeaveMinutes,
      overtimeMinutes,
      hasLeave: !!leave,
      leaveDays: leave?.days ?? 0,
      status,
    });

    cursor = new Date(cursor.getTime() + 24 * 60 * 60_000);
  }

  return summaries;
}

export type MonthlyTotals = {
  expectedDays: number;          // 該月應出勤天數
  actualDays: number;            // 實際出勤（有完整上下班）
  absentDays: number;
  leaveDays: number;             // 請假總天數
  totalMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  hasFullAttendance: boolean;    // 無遲到/早退/缺勤/請假
};

export function rollupTotals(summaries: DailySummary[]): MonthlyTotals {
  let expectedDays = 0;
  let actualDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let totalMinutes = 0;
  let lateMinutes = 0;
  let earlyLeaveMinutes = 0;
  let overtimeMinutes = 0;

  for (const s of summaries) {
    if (s.status === "FUTURE") continue;
    if (s.isWorkday) expectedDays += 1;
    if (s.status === "ABSENT") absentDays += 1;
    if (s.status === "ON_TIME" || s.status === "LATE" || s.status === "EARLY_LEAVE") {
      actualDays += 1;
    }
    leaveDays += s.leaveDays;
    totalMinutes += s.workMinutes;
    lateMinutes += s.lateMinutes;
    earlyLeaveMinutes += s.earlyLeaveMinutes;
    overtimeMinutes += s.overtimeMinutes;
  }

  const hasFullAttendance =
    expectedDays > 0 &&
    absentDays === 0 &&
    lateMinutes === 0 &&
    earlyLeaveMinutes === 0 &&
    leaveDays === 0;

  return {
    expectedDays,
    actualDays,
    absentDays,
    leaveDays,
    totalMinutes,
    lateMinutes,
    earlyLeaveMinutes,
    overtimeMinutes,
    hasFullAttendance,
  };
}
