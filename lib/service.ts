import { differenceInDays, addDays, startOfDay, max as maxDate, isBefore } from "date-fns";
import type { EmploymentType } from "@prisma/client";

export type Period = {
  id?: string;
  type: EmploymentType;
  startDate: Date;
  endDate: Date | null; // null = 至今
  countsTowardSeniority: boolean;
  note?: string | null;
};

/**
 * 合併重疊區段、扣除重疊部分。回傳合併後不重疊的時間段。
 * **注意**：依公司政策，僅「正職（FULL_TIME）」會計入特休年資；
 * 兼職、工讀、約聘即使勾選「計入年資」也會被忽略。
 */
function mergeCredited(periods: Period[], asOf: Date): { start: Date; end: Date }[] {
  const today = startOfDay(asOf);
  const segs = periods
    .filter((p) => p.countsTowardSeniority && p.type === "FULL_TIME")
    .map((p) => ({
      start: startOfDay(p.startDate),
      end: startOfDay(p.endDate ?? today),
    }))
    .filter((s) => !isBefore(s.end, s.start)) // end >= start
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: { start: Date; end: Date }[] = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && !isBefore(addDays(last.end, 1), s.start)) {
      last.end = maxDate([last.end, s.end]);
    } else {
      merged.push({ ...s });
    }
  }
  return merged;
}

/** 計入年資的總天數（合併重疊後） */
export function creditedDays(periods: Period[], asOf: Date = new Date()): number {
  let total = 0;
  for (const seg of mergeCredited(periods, asOf)) {
    total += differenceInDays(seg.end, seg.start) + 1; // 含當日
  }
  return total;
}

/** 把總天數換算為「Y 年 M 個月」字串 */
export function formatService(days: number): string {
  if (days <= 0) return "0 個月";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} 年`);
  if (months > 0 || years === 0) parts.push(`${months} 個月`);
  return parts.join(" ");
}

/**
 * 由經歷段推算「建議的等效到職日」：
 * 用 asOf - creditedDays 反推，讓特休計算與實際年資一致。
 * 若無任何計入年資的段，回傳 null（請沿用原 hireDate）。
 */
export function suggestedHireDate(periods: Period[], asOf: Date = new Date()): Date | null {
  const days = creditedDays(periods, asOf);
  if (days <= 0) return null;
  return startOfDay(addDays(asOf, -(days - 1)));
}

/**
 * 取得「實際用於特休計算的到職日」：
 * - 若該員工有任何「正職且計入年資」的段 → 回傳依該段推算的有效到職日
 * - 否則回傳原 hireDate（向下相容）
 */
export function effectiveHireDate(
  hireDate: Date,
  periods: Period[],
  asOf: Date = new Date(),
): Date {
  const suggested = suggestedHireDate(periods, asOf);
  return suggested ?? hireDate;
}

/** 取得「目前」雇用類型（最新尚未結束 / 最近結束的段）*/
export function currentEmploymentType(periods: Period[], asOf: Date = new Date()): EmploymentType | null {
  if (periods.length === 0) return null;
  const today = startOfDay(asOf);
  const ongoing = periods
    .filter((p) => !p.endDate || !isBefore(startOfDay(p.endDate), today))
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  if (ongoing[0]) return ongoing[0].type;
  // 否則回傳最近結束的
  const sorted = [...periods].sort(
    (a, b) => (b.endDate ?? today).getTime() - (a.endDate ?? today).getTime(),
  );
  return sorted[0]?.type ?? null;
}
