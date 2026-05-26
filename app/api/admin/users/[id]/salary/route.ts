import { NextResponse } from "next/server";
import { z } from "zod";
import { SalaryType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  type: z.nativeEnum(SalaryType),
  amount: z.number().min(0),
  fullAttendanceBonus: z.number().min(0).default(0),
  lateDeductionPerMinute: z.number().min(0).default(0),
  leaveDeductPerDay: z.number().min(0).nullable().optional(),
  laborInsurance: z.number().min(0).default(0),
  healthInsurance: z.number().min(0).default(0),
  laborPensionSelf: z.number().min(0).default(0),
  scheduleId: z.string().nullable().optional(),
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

  const { scheduleId, ...salaryData } = parsed.data;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // 結束目前生效的薪資（若有）
    await tx.salaryConfig.updateMany({
      where: { userId: id, effectiveTo: null },
      data: { effectiveTo: now },
    });
    await tx.salaryConfig.create({
      data: {
        userId: id,
        ...salaryData,
        leaveDeductPerDay: salaryData.leaveDeductPerDay ?? null,
        effectiveFrom: now,
      },
    });

    if (scheduleId !== undefined) {
      await tx.userSchedule.updateMany({
        where: { userId: id, effectiveTo: null },
        data: { effectiveTo: now },
      });
      if (scheduleId) {
        await tx.userSchedule.create({
          data: {
            userId: id,
            scheduleId,
            effectiveFrom: now,
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
