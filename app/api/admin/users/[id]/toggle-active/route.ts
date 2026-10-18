import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/leave-actions";

export const dynamic = "force-dynamic";

const schema = z.object({ active: z.boolean() });

/**
 * 啟用 / 停用員工（軟性刪除）。
 * 不改動資料、不刪請假紀錄，只翻 User.active flag。
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });

  if (id === session.userId && parsed.data.active === false) {
    return NextResponse.json({ error: "不能停用自己" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { active: parsed.data.active },
    select: { id: true, active: true, name: true },
  });

  await logAudit(session.userId, parsed.data.active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "User", id);

  return NextResponse.json({ ok: true, user });
}
