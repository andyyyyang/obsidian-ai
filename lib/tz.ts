/**
 * Asia/Taipei 時區工具。
 *
 * 所有打卡時間一律儲存 UTC，顯示時轉 +08:00。
 * 不引入 date-fns-tz 以避免增加依賴；台北是固定 UTC+8 無 DST。
 */

const TPE_OFFSET_MIN = 8 * 60;

/** Date → "YYYY-MM-DD"（台北日曆日） */
export function tpeDateString(d: Date): string {
  const t = new Date(d.getTime() + TPE_OFFSET_MIN * 60_000);
  return t.toISOString().slice(0, 10);
}

/** Date → "HH:mm"（台北時間） */
export function tpeTimeString(d: Date): string {
  const t = new Date(d.getTime() + TPE_OFFSET_MIN * 60_000);
  return t.toISOString().slice(11, 16);
}

/** Date → "YYYY-MM-DD HH:mm"（台北時間） */
export function tpeDateTimeString(d: Date): string {
  const t = new Date(d.getTime() + TPE_OFFSET_MIN * 60_000);
  return `${t.toISOString().slice(0, 10)} ${t.toISOString().slice(11, 16)}`;
}

/** "YYYY-MM-DD" + "HH:mm"（台北）→ UTC Date */
export function tpeToUtc(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00+08:00`);
}

/** 取得某月 [start, endExclusive) UTC 區間（以台北月為準） */
export function tpeMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+08:00`);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+08:00`);
  return { start, end };
}

/** 取得某天 [start, endExclusive) UTC 區間（以台北日為準） */
export function tpeDayRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00+08:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60_000);
  return { start, end };
}

/** 取得台北「今天」的日期字串 */
export function tpeToday(): string {
  return tpeDateString(new Date());
}

/** 計算兩日期之間的「台北日曆日」數（含起訖） */
export function tpeDayCount(start: Date, endExclusive: Date): number {
  const ms = endExclusive.getTime() - start.getTime();
  return Math.round(ms / (24 * 60 * 60_000));
}

/** 台北星期幾（0=週日, 6=週六） */
export function tpeWeekday(d: Date): number {
  const t = new Date(d.getTime() + TPE_OFFSET_MIN * 60_000);
  return t.getUTCDay();
}

/** 取得某日期所屬「週一起始」的週區間（以台北時間為準） */
export function tpeWeekRange(d: Date = new Date()): { start: Date; end: Date; days: string[] } {
  const dateStr = tpeDateString(d);
  const startOfDay = new Date(`${dateStr}T00:00:00+08:00`);
  const weekday = tpeWeekday(d); // 0=Sun..6=Sat
  // 想要 Mon=0..Sun=6，把日轉為週末
  const mondayOffset = (weekday + 6) % 7;
  const start = new Date(startOfDay.getTime() - mondayOffset * 24 * 60 * 60_000);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60_000);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(tpeDateString(new Date(start.getTime() + i * 24 * 60 * 60_000)));
  }
  return { start, end, days };
}
