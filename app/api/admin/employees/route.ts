import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { employeeNo: "asc" },
    select: {
      id: true,
      employeeNo: true,
      email: true,
      name: true,
      role: true,
      jobTitle: true,
      hireDate: true,
      active: true,
    },
  });
  return NextResponse.json(users);
}

const createSchema = z.object({
  employeeNo: z.string().min(1).max(20),
  email: z.string().email(),
  name: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(Role),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  jobTitle: z.string().max(50).optional().nullable(),
});

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "輸入格式有誤" }, { status: 400 });
  }
  const data = parsed.data;

  const dup = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { employeeNo: data.employeeNo }] },
    select: { id: true },
  });
  if (dup) {
    return NextResponse.json({ error: "員編或 Email 已存在" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const created = await prisma.user.create({
    data: {
      employeeNo: data.employeeNo,
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role,
      hireDate: new Date(`${data.hireDate}T00:00:00+08:00`),
      jobTitle: data.jobTitle || null,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
