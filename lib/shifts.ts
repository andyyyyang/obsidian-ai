/**
 * 班表共用工具
 */
import { tpeToUtc } from "./tz";

export function parseShiftDate(dateStr: string): Date {
  return tpeToUtc(dateStr, "00:00");
}

/** 解析 TSV / CSV 批次匯入文字
 *  欄位順序 (一行一筆)：員編<TAB>日期<TAB>開始<TAB>結束<TAB>備註(可省)
 *  日期格式：YYYY-MM-DD
 *  時間格式：HH:mm，若 *休假* 則填 OFF
 *
 * 範例：
 *   S001\t2026-06-01\t09:00\t18:00\t晚班
 *   S001\t2026-06-02\tOFF\t\t休假
 */
export type ParsedShiftRow = {
  employeeNo: string;
  date: string;          // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  isOff: boolean;
  note: string | null;
};

export type ParseResult = {
  ok: ParsedShiftRow[];
  errors: { line: number; message: string }[];
};

export function parseShiftImport(raw: string): ParseResult {
  const lines = raw.split(/\r?\n/);
  const ok: ParsedShiftRow[] = [];
  const errors: ParseResult["errors"] = [];

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    // 支援 TAB 或 逗號 分隔
    const cols = line.includes("\t") ? line.split("\t") : line.split(",");
    const [emp, date, startRaw, endRaw, ...rest] = cols.map((c) => c.trim());
    const note = rest.join(",").trim() || null;

    if (!emp) return errors.push({ line: i + 1, message: "缺少員編" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return errors.push({ line: i + 1, message: `日期格式 (${date}) 應為 YYYY-MM-DD` });

    const isOff = !startRaw || startRaw.toUpperCase() === "OFF";
    let startTime: string | null = null;
    let endTime: string | null = null;
    if (!isOff) {
      if (!/^\d{2}:\d{2}$/.test(startRaw)) return errors.push({ line: i + 1, message: `開始時間格式 (${startRaw}) 應為 HH:mm 或 OFF` });
      if (!/^\d{2}:\d{2}$/.test(endRaw)) return errors.push({ line: i + 1, message: `結束時間格式 (${endRaw}) 應為 HH:mm` });
      startTime = startRaw;
      endTime = endRaw;
    }

    ok.push({ employeeNo: emp, date, startTime, endTime, isOff, note });
  });

  return { ok, errors };
}

/** 抓本週的「週一 ~ 週日」UTC 日期序列（以台北日為準） */
export function tpeWeekDates(d: Date = new Date()): string[] {
  const TPE_OFFSET_MIN = 8 * 60;
  const t = new Date(d.getTime() + TPE_OFFSET_MIN * 60_000);
  const weekday = t.getUTCDay(); // 0=Sun..6=Sat
  const mondayOffset = (weekday + 6) % 7;
  const start = new Date(t.getTime() - mondayOffset * 24 * 60 * 60_000);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start.getTime() + i * 24 * 60 * 60_000);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}
