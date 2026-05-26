/**
 * 開發環境 seed — 建立示範員工 + 餐廳資料
 * 使用：pnpm db:seed（會在已 reset 的 DB 上跑）
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const employees = [
  { employeeNo: "S001", email: "chef@example.com",   name: "阿明 (主廚)",  jobTitle: "主廚",   role: Role.MANAGER, hat: "chef",   apron: true },
  { employeeNo: "S002", email: "sue@example.com",    name: "小慧 (外場)",  jobTitle: "外場",   role: Role.EMPLOYEE, hat: "waiter", apron: true },
  { employeeNo: "S003", email: "bar@example.com",    name: "阿凱 (吧台)",  jobTitle: "吧台",   role: Role.EMPLOYEE, hat: null,     apron: true },
  { employeeNo: "S004", email: "kid@example.com",    name: "小柔 (二廚)",  jobTitle: "二廚",   role: Role.EMPLOYEE, hat: "chef",   apron: true },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  for (let i = 0; i < employees.length; i++) {
    const e = employees[i];
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: {},
      create: {
        employeeNo: e.employeeNo,
        email: e.email,
        name: e.name,
        passwordHash,
        role: e.role,
        jobTitle: e.jobTitle,
      },
    });
    await prisma.avatarConfig.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        skinTone: i % 4,
        hairStyle: i % 5,
        hairColor: (i * 3) % 8,
        shirtColor: (i * 2) % 8,
        pantsColor: i % 8,
        shoeColor: i % 4,
        eyeStyle: i % 3,
        hat: e.hat,
        apron: e.apron,
        statusMessage: ["今天客人好多！", "燙！", "歡迎光臨", "三號桌出餐"][i] ?? null,
      },
    });
  }

  await prisma.restaurant.upsert({
    where: { id: "demo-store" },
    update: {},
    create: {
      id: "demo-store",
      name: "示範店",
      address: "台北市信義區忠孝東路五段 7 號",
      latitude: 25.0331,
      longitude: 121.5654,
      radiusMeters: 500,
    },
  });

  console.log("seed ok — 預設密碼：password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
