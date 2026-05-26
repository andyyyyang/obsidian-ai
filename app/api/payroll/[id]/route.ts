import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { calculateNetPay } from "@/lib/payroll";

const schema = z.object({
  overtimePay: z.number().min(0).optional(),
  otherBonus: z.number().min(0).optional(),
  incomeTax: z.number().min(0).optional(),
  otherDeduction: z.number().min(0).optional(),
  laborInsurance: z.number().min(0).optional(),
  healthInsurance: z.number().min(0).optional(),
  laborPensionSelf: z.number().min(0).optional(),
  note: z.string().max(500).nullable().optional(),
});

// 讓 HR 微調手動欄位（加班費、所得稅、勞健保覆寫等），netPay 會自動重算
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const existing = await prisma.payroll.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "找不到薪資單" }, { status: 404 });
  }

  const merged = {
    ...existing,
    ...parsed.data,
  };
  const netPay = calculateNetPay(merged);

  const updated = await prisma.payroll.update({
    where: { id },
    data: { ...parsed.data, netPay },
  });

  return NextResponse.json({ ok: true, netPay: updated.netPay });
}
