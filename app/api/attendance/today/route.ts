import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { tpeToday, tpeDayRange } from "@/lib/tz";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = tpeToday();
  const { start, end } = tpeDayRange(today);

  const punches = await prisma.attendance.findMany({
    where: {
      userId: session.userId,
      punchedAt: { gte: start, lt: end },
    },
    orderBy: { punchedAt: "asc" },
    include: { office: { select: { name: true } } },
  });

  return NextResponse.json({
    date: today,
    punches: punches.map((p) => ({
      id: p.id,
      type: p.type,
      punchedAt: p.punchedAt.toISOString(),
      officeName: p.office?.name,
    })),
  });
}
