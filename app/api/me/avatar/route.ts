import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const nullableInt = z.number().int().min(0).max(99999999).nullable();
const requiredInt = z.number().int().min(0).max(99999999);

const schema = z.object({
  bodyId: requiredInt,
  headId: requiredInt,
  faceId: requiredInt,
  hairId: requiredInt,
  hatId: nullableInt,
  topId: nullableInt,
  bottomId: nullableInt,
  overallId: nullableInt,
  shoesId: nullableInt,
  capeId: nullableInt,
  glovesId: nullableInt,
  weaponId: nullableInt,
  faceAccessoryId: nullableInt,
  eyeAccessoryId: nullableInt,
  earringsId: nullableInt,
  version: z.string().min(1).max(10).optional(),
  statusMessage: z.string().max(60).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤", detail: parsed.error.format() }, { status: 400 });
  }

  const { statusMessage, version, ...look } = parsed.data;
  const cleanStatus = statusMessage?.trim() || null;

  await prisma.avatarConfig.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      ...look,
      version: version ?? "222",
      statusMessage: cleanStatus,
    },
    update: {
      ...look,
      version: version ?? "222",
      statusMessage: cleanStatus,
    },
  });

  return NextResponse.json({ ok: true });
}
