/**
 * 首次 / 持續部署的初始化：
 *   1. User 表是空的 → 用 INITIAL_ADMIN_* 環境變數建第一位 admin
 *   2. Restaurant 表是空的 → 建一間「本店」範例分店（與 User 檢查獨立）
 *
 * 兩個檢查互不相干，這樣即使 User 已存在（舊系統升級），
 * 也會確保至少有一間分店可以打卡。
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureFirstAdmin() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log(`[bootstrap] 已有 ${count} 位使用者，跳過初始管理員建立。`);
    return;
  }

  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME ?? "店長";

  if (!email || !password) {
    console.warn(
      "[bootstrap] 找不到 INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD，跳過初始 admin。",
    );
    return;
  }
  if (password.length < 8) {
    console.error("[bootstrap] INITIAL_ADMIN_PASSWORD 至少需 8 字元");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      employeeNo: "M001",
      email,
      name,
      passwordHash,
      role: Role.ADMIN,
      jobTitle: "店長",
    },
  });
  console.log(`[bootstrap] ✓ 已建立首位管理員：${email}（員編 M001）`);
}

async function ensureFirstRestaurant() {
  const count = await prisma.restaurant.count();
  if (count > 0) {
    console.log(`[bootstrap] 已有 ${count} 間分店，跳過範例分店建立。`);
    return;
  }
  await prisma.restaurant.create({
    data: {
      name: "本店",
      address: "請至 /admin/restaurants 設定地址",
      radiusMeters: 5000,  // 預設給大範圍，員工不會被擋住打卡 (店長要記得縮)
    },
  });
  console.log(`[bootstrap] ✓ 已建立範例分店「本店」（5km 半徑，請至後台縮小）`);
}

async function main() {
  await ensureFirstAdmin();
  await ensureFirstRestaurant();
  console.log(`[bootstrap] 完成。`);
}

main()
  .catch((e) => {
    console.error("[bootstrap] 失敗：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
