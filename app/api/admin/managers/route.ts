import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * 可指派為主管的候選人 — MANAGER + ADMIN、必須在職。
 * Quick-reassign popover 用。
 */
export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const managers = await prisma.user.findMany({
    where: {
      active: true,
      role: { in: [Role.MANAGER, Role.ADMIN] },
    },
    orderBy: { employeeNo: "asc" },
    select: {
      id: true,
      name: true,
      employeeNo: true,
      department: true,
      role: true,
    },
  });

  return NextResponse.json({ managers });
}
