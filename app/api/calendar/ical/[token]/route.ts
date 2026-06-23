import { NextResponse } from "next/server";
import { addMonths, startOfDay } from "date-fns";
import { LeaveStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyIcalToken } from "@/lib/ical-token";
import { buildIcs } from "@/lib/ical";
import { getBirthdaysInRange, getAnniversariesInRange } from "@/lib/widgets";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token: raw } = await ctx.params;
  // 容許 .ics 副檔名
  const token = raw.endsWith(".ics") ? raw.slice(0, -4) : raw;
  const userId = verifyIcalToken(token);
  if (!userId) {
    return new NextResponse("Invalid token", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, active: true },
  });
  if (!user || !user.active) {
    return new NextResponse("Subscription revoked", { status: 410 });
  }

  // 範圍：過去 1 個月 ~ 未來 6 個月
  const today = startOfDay(new Date());
  const from = addMonths(today, -1);
  const to = addMonths(today, 6);

  const [requests, birthdays, anniversaries] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: {
        status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
        AND: [{ startDate: { lte: to } }, { endDate: { gte: from } }],
      },
      include: { requester: { select: { id: true, name: true } } },
      orderBy: { startDate: "asc" },
    }),
    getBirthdaysInRange(from, to),
    getAnniversariesInRange(from, to),
  ]);

  const ics = buildIcs({
    calendarName: `公司請假行事曆 (for ${user.name})`,
    leaves: requests.map((r) => ({
      id: r.id,
      name: r.requester.name,
      startDate: r.startDate,
      endDate: r.endDate,
      isHalfDay: r.isHalfDay,
      halfDayPeriod: r.halfDayPeriod as "AM" | "PM" | null,
      status: r.status as "APPROVED" | "PENDING",
      isMine: r.requester.id === userId,
    })),
    birthdays: birthdays.map((b) => ({ userId: b.userId, name: b.name, date: b.date })),
    anniversaries: anniversaries.map((a) => ({
      userId: a.userId,
      name: a.name,
      date: a.date,
      years: a.years,
    })),
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": 'inline; filename="company-leave.ics"',
    },
  });
}
