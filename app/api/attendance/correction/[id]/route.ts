import { NextResponse } from "next/server";
import { z } from "zod";
import { CorrectionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(500).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId || (session.role !== "MANAGER" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "輸入格式有誤" }, { status: 400 });
  }

  const correction = await prisma.attendanceCorrection.findUnique({ where: { id } });
  if (!correction) {
    return NextResponse.json({ error: "找不到申請" }, { status: 404 });
  }
  if (correction.status !== "PENDING") {
    return NextResponse.json({ error: "此申請已處理" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.attendanceCorrection.update({
      where: { id },
      data: {
        status: parsed.data.decision as CorrectionStatus,
        reviewedById: session.userId!,
        reviewedAt: new Date(),
        reviewNote: parsed.data.reviewNote,
      },
    });

    if (parsed.data.decision === "APPROVED") {
      await tx.attendance.create({
        data: {
          userId: correction.userId,
          type: correction.type,
          punchedAt: correction.proposedTime,
          isManualEntry: true,
          approvedById: session.userId!,
          note: `補登：${correction.reason}`,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
