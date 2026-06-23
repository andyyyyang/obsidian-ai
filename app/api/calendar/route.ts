import { NextResponse } from "next/server";
import { LeaveStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getBirthdaysInRange, getAnniversariesInRange } from "@/lib/widgets";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ error: "missing from/to" }, { status: 400 });
  }
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const includeParam = url.searchParams.get("include");
  const include = new Set(
    (includeParam ?? "leave,birthday,anniversary").split(",").map((s) => s.trim()),
  );

  const [leaves, birthdays, anniversaries] = await Promise.all([
    include.has("leave")
      ? prisma.leaveRequest.findMany({
          where: {
            status: { in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
            AND: [{ startDate: { lte: toDate } }, { endDate: { gte: fromDate } }],
          },
          include: {
            requester: { select: { id: true, name: true, department: true } },
          },
          orderBy: { startDate: "asc" as const },
        })
      : Promise.resolve(
          [] as Awaited<
            ReturnType<
              typeof prisma.leaveRequest.findMany<{
                include: { requester: { select: { id: true; name: true; department: true } } };
              }>
            >
          >,
        ),
    include.has("birthday") ? getBirthdaysInRange(fromDate, toDate) : Promise.resolve([]),
    include.has("anniversary")
      ? getAnniversariesInRange(fromDate, toDate)
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    leaves: leaves.map((r) => ({
      id: r.id,
      requesterId: r.requester.id,
      name: r.requester.name,
      department: r.requester.department,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      isHalfDay: r.isHalfDay,
      halfDayPeriod: r.halfDayPeriod,
      status: r.status,
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
  });
}
