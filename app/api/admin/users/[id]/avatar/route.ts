import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  skinTone: z.number().int().min(0).max(7),
  hairStyle: z.number().int().min(0).max(10),
  hairColor: z.number().int().min(0).max(15),
  shirtColor: z.number().int().min(0).max(15),
  pantsColor: z.number().int().min(0).max(15),
  shoeColor: z.number().int().min(0).max(7),
  eyeStyle: z.number().int().min(0).max(5),
  hat: z.enum(["cap", "wizard", "santa", "crown"]).nullable(),
  glasses: z.enum(["round", "square", "sunglasses"]).nullable(),
  backpack: z.boolean(),
  statusMessage: z.string().max(60).nullable().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }
  const { statusMessage, ...look } = parsed.data;
  const cleanStatus = statusMessage?.trim() || null;
  await prisma.avatarConfig.upsert({
    where: { userId: id },
    create: { userId: id, ...look, statusMessage: cleanStatus },
    update: { ...look, statusMessage: cleanStatus },
  });
  return NextResponse.json({ ok: true });
}
