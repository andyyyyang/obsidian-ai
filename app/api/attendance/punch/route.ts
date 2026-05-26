import { NextResponse } from "next/server";
import { z } from "zod";
import { PunchType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkPunchLocation, getClientIp } from "@/lib/geo";

const schema = z.object({
  type: z.nativeEnum(PunchType),
  officeId: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  userAgent: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const office = await prisma.office.findUnique({ where: { id: parsed.data.officeId } });
  if (!office || !office.active) {
    return NextResponse.json({ error: "辦公地點不存在" }, { status: 404 });
  }

  const ipAddress = getClientIp(req);
  const check = checkPunchLocation(office, {
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    ipAddress,
  });

  if (!check.valid) {
    return NextResponse.json(
      { error: check.reason ?? "位置驗證失敗" },
      { status: 403 },
    );
  }

  // 防重複：5 秒內同一員工/同一 type 視為重複
  const recent = await prisma.attendance.findFirst({
    where: {
      userId: session.userId,
      type: parsed.data.type,
      punchedAt: { gt: new Date(Date.now() - 5000) },
    },
  });
  if (recent) {
    return NextResponse.json({ error: "請勿重複打卡" }, { status: 409 });
  }

  const created = await prisma.attendance.create({
    data: {
      userId: session.userId,
      type: parsed.data.type,
      punchedAt: new Date(),
      officeId: office.id,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      ipAddress: ipAddress ?? undefined,
      userAgent: parsed.data.userAgent ?? req.headers.get("user-agent") ?? undefined,
      locationValid: true,
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      type: created.type,
      punchedAt: created.punchedAt.toISOString(),
      distance: check.distance,
    },
    { status: 201 },
  );
}
