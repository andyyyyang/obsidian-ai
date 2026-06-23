import { addDays, format } from "date-fns";

export type IcalLeave = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date; // inclusive
  isHalfDay: boolean;
  halfDayPeriod: "AM" | "PM" | null;
  status: "APPROVED" | "PENDING";
  isMine: boolean;
};

export type IcalBirthday = {
  userId: string;
  name: string;
  date: Date;
};

export type IcalAnniversary = {
  userId: string;
  name: string;
  date: Date;
  years: number;
};

function fmtDate(d: Date): string {
  return format(d, "yyyyMMdd");
}

/** ICS 規範：> 75 字元的行要 fold（接續行以一個 space 開頭） */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const size = i === 0 ? 75 : 74; // 後續行第一字是 space
    chunks.push((i === 0 ? "" : " ") + line.slice(i, i + size));
    i += size;
  }
  return chunks.join("\r\n");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function event(opts: {
  uid: string;
  start: Date; // 全日事件起始（含）
  end: Date; // 全日事件結束（含）→ ICS DTEND 用「不含當日」所以要 +1
  summary: string;
  description?: string;
  categories?: string[];
}): string[] {
  const dtStart = fmtDate(opts.start);
  const dtEnd = fmtDate(addDays(opts.end, 1));
  const lines = [
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    fold(`SUMMARY:${escapeText(opts.summary)}`),
  ];
  if (opts.description) lines.push(fold(`DESCRIPTION:${escapeText(opts.description)}`));
  if (opts.categories && opts.categories.length > 0) {
    lines.push(`CATEGORIES:${opts.categories.join(",")}`);
  }
  lines.push("TRANSP:TRANSPARENT");
  lines.push("END:VEVENT");
  return lines;
}

export function buildIcs(opts: {
  calendarName: string;
  leaves: IcalLeave[];
  birthdays: IcalBirthday[];
  anniversaries: IcalAnniversary[];
}): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Obsidian Leave System//ZH-TW//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:${escapeText(opts.calendarName)}`),
    "X-WR-TIMEZONE:Asia/Taipei",
  ];

  for (const lv of opts.leaves) {
    const halfLabel = lv.isHalfDay ? ` (½ ${lv.halfDayPeriod ?? ""})`.trimEnd() : "";
    const statusLabel = lv.status === "PENDING" ? "「待審」" : "";
    const summary = `${lv.name}${statusLabel} 請假${halfLabel}`;
    const cats = ["LEAVE", lv.status];
    if (lv.isMine) cats.push("MINE");
    lines.push(
      ...event({
        uid: `leave-${lv.id}@obsidian-leave`,
        start: lv.startDate,
        end: lv.endDate,
        summary,
        description: `狀態：${lv.status === "APPROVED" ? "已核准" : "申請中"}`,
        categories: cats,
      }),
    );
  }

  for (const b of opts.birthdays) {
    lines.push(
      ...event({
        uid: `birthday-${b.userId}-${format(b.date, "yyyy")}@obsidian-leave`,
        start: b.date,
        end: b.date,
        summary: `🎂 ${b.name} 生日`,
        categories: ["BIRTHDAY"],
      }),
    );
  }

  for (const a of opts.anniversaries) {
    lines.push(
      ...event({
        uid: `anniversary-${a.userId}-${format(a.date, "yyyy")}@obsidian-leave`,
        start: a.date,
        end: a.date,
        summary: `🎉 ${a.name} ${a.years} 週年`,
        categories: ["ANNIVERSARY"],
      }),
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
