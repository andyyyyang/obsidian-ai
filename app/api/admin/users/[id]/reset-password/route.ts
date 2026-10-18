import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import * as bcrypt from "@node-rs/bcrypt";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logAudit } from "@/lib/leave-actions";

export const dynamic = "force-dynamic";

/**
 * 產生 12 字元的臨時密碼（可讀，不含易混字 0/O/1/l/I）並回傳明碼一次。
 * 管理者有責任把密碼轉達給員工。
 */
function generatePassword(len = 12): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const password = generatePassword(12);
  const passwordHash = await bcrypt.hash(password, { cost: 12 });

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  await logAudit(session.userId, "PASSWORD_RESET", "User", id);

  return NextResponse.json({ password });
}
