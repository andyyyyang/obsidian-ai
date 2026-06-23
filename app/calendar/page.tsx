import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { LeaveStatus } from "@prisma/client";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { getBirthdaysInRange, getAnniversariesInRange } from "@/lib/widgets";
import { signIcalToken } from "@/lib/ical-token";
import { CalendarClient } from "./calendar-client";

export const dynamic = "force-dynamic";

function parseMonth(s: string | undefined): Date {
  if (s && /^\d{4}-\d{2}$/.test(s)) {
    return new Date(`${s}-01T00:00:00`);
  }
  return startOfMonth(new Date());
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const { month } = await searchParams;
  const cursor = parseMonth(month);
  // 預載 cursor 的上下月 + 當月（共 3 個月）
  const from = subMonths(startOfMonth(cursor), 1);
  const to = addMonths(startOfMonth(cursor), 2);

  const [leaves, birthdays, anniversaries] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: {
        status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
        AND: [{ startDate: { lte: to } }, { endDate: { gte: from } }],
      },
      include: { requester: { select: { id: true, name: true, department: true } } },
      orderBy: { startDate: "asc" },
    }),
    getBirthdaysInRange(from, to),
    getAnniversariesInRange(from, to),
  ]);

  const initial = {
    leaves: leaves.map((r) => ({
      id: r.id,
      requesterId: r.requester.id,
      name: r.requester.name,
      department: r.requester.department,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      isHalfDay: r.isHalfDay,
      halfDayPeriod: r.halfDayPeriod as "AM" | "PM" | null,
      status: r.status as "APPROVED" | "PENDING",
    })),
    birthdays: birthdays.map((b) => ({
      userId: b.userId,
      name: b.name,
      department: b.department,
      date: b.date.toISOString(),
    })),
    anniversaries: anniversaries.map((a) => ({
      userId: a.userId,
      name: a.name,
      department: a.department,
      date: a.date.toISOString(),
      years: a.years,
    })),
  };

  const icalToken = signIcalToken(session.userId);

  // 推算 origin 給 iCal button 用
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="團隊請假行事曆"
        subtitle="已核准與申請中的請假，加上同事生日與週年"
        back={{ href: "/", label: "回首頁" }}
      />
      <CalendarClient
        initial={initial}
        meId={session.userId}
        initialMonth={format(cursor, "yyyy-MM")}
        icalToken={icalToken}
        origin={origin}
      />
    </main>
  );
}
