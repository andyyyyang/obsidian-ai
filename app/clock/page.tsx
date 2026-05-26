import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { PunchCard } from "@/components/punch-card";

export const dynamic = "force-dynamic";

export default async function ClockPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const today = tpeToday();
  const { start, end } = tpeDayRange(today);

  const [offices, punches] = await Promise.all([
    prisma.office.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, latitude: true, longitude: true },
    }),
    prisma.attendance.findMany({
      where: {
        userId: session.userId,
        punchedAt: { gte: start, lt: end },
      },
      orderBy: { punchedAt: "asc" },
      include: { office: { select: { name: true } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">員工打卡</h1>

      {offices.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          目前尚未設定任何辦公地點，請聯絡 HR 於後台新增。
        </div>
      ) : (
        <PunchCard
          offices={offices.map((o) => ({ ...o }))}
          initialPunches={punches.map((p) => ({
            id: p.id,
            type: p.type,
            punchedAt: p.punchedAt.toISOString(),
            officeName: p.office?.name,
          }))}
        />
      )}

      <div className="mt-6 text-center">
        <Link href="/attendance" className="text-sm text-slate-500 underline-offset-4 hover:underline">
          查看我的出勤紀錄 →
        </Link>
      </div>
    </main>
  );
}
