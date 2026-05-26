import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(100),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakMinutes: z.number().int().min(0).max(480).default(60),
  workDays: z.number().int().min(0).max(127),
  lateGraceMinutes: z.number().int().min(0).max(120).default(0),
  officeId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }
  const created = await prisma.workSchedule.create({ data: parsed.data });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
