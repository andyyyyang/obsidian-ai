/**
 * 首次部署自動建立第一位 admin 帳號 + 一間範例餐廳。
 *
 * 行為：
 *   - 若資料庫內已有任何 User，跳過（不會洗掉現有資料）
 *   - 否則使用 INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD / INITIAL_ADMIN_NAME 建立
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
      "[bootstrap] 找不到 INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD，跳過。\n" +
        "          首次部署請在環境變數內設定這兩個值。",
    );
    return;
  }
  if (password.length < 8) {
    console.error("[bootstrap] INITIAL_ADMIN_PASSWORD 至少需 8 字元");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        employeeNo: "M001",
        email,
        name,
        passwordHash,
        role: Role.ADMIN,
        jobTitle: "店長",
      },
    });
    await tx.restaurant.create({
      data: {
        name: "本店",
        address: "請至後台設定地址",
        radiusMeters: 200,
      },
    });
  });

  console.log(`[bootstrap] ✓ 已建立首位管理員：${email}（員編 M001）`);
  console.log(`[bootstrap] ✓ 已建立範例餐廳：本店`);
  console.log(`[bootstrap]   登入後請至 /admin 修改密碼、新增餐廳座標與員工。`);
}

main()
  .catch((e) => {
    console.error("[bootstrap] 失敗：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
