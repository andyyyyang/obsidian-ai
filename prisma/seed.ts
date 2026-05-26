/**
 * 開發環境 seed — 建立示範員工 + 餐廳資料
 * 使用：pnpm db:seed（會在已 reset 的 DB 上跑）
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 每位員工不同的造型 — 都用 maplestory.io 已驗證可用的 item ID
const employees = [
  {
    employeeNo: "S001", email: "chef@example.com", name: "阿明 (主廚)",
    jobTitle: "主廚", role: Role.MANAGER,
    statusMessage: "歡迎光臨！",
    avatar: {
      bodyId: 2000, headId: 12000, faceId: 20023, hairId: 30030,
      hatId: 1004032, overallId: 1053650, shoesId: 1072740,
      weaponId: 1322000,
    },
  },
  {
    employeeNo: "S002", email: "sue@example.com", name: "小慧 (外場)",
    jobTitle: "外場", role: Role.EMPLOYEE,
    statusMessage: "三號桌出餐",
    avatar: {
      bodyId: 2001, headId: 12001, faceId: 20012, hairId: 36082,
      hatId: 1005006, topId: 1042257, bottomId: 1062168, shoesId: 1072025,
    },
  },
  {
    employeeNo: "S003", email: "bar@example.com", name: "阿凱 (吧台)",
    jobTitle: "吧台", role: Role.EMPLOYEE,
    statusMessage: "拿鐵好了",
    avatar: {
      bodyId: 2002, headId: 12002, faceId: 20005, hairId: 33000,
      hatId: 1004036, topId: 1042200, bottomId: 1062200, shoesId: 1072039,
      eyeAccessoryId: 1022231,
    },
  },
  {
    employeeNo: "S004", email: "kid@example.com", name: "小柔 (二廚)",
    jobTitle: "二廚", role: Role.EMPLOYEE,
    statusMessage: "燙！",
    avatar: {
      bodyId: 2000, headId: 12000, faceId: 20002, hairId: 34020,
      hatId: 1004032, topId: 1042003, bottomId: 1062007, shoesId: 1072740,
    },
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  for (const e of employees) {
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
        ...e.avatar,
        statusMessage: e.statusMessage,
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
