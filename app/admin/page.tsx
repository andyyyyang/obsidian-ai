import Link from "next/link";
import { ArrowUpRight, Building2, ClipboardList, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { GlassCard } from "@/components/glass-card";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { start, end } = tpeDayRange(tpeToday());

  const [employeeCount, activeRestaurantCount, todayPunchCount, todayPunches] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.restaurant.count({ where: { active: true } }),
    prisma.attendance.count({ where: { punchedAt: { gte: start, lt: end } } }),
    prisma.attendance.findMany({
      where: { punchedAt: { gte: start, lt: end } },
      orderBy: { punchedAt: "asc" },
      select: { userId: true, type: true },
    }),
  ]);

  const last = new Map<string, string>();
  for (const p of todayPunches) last.set(p.userId, p.type);
  const onShift = Array.from(last.values()).filter((t) => t !== "CLOCK_OUT").length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">店長後台</h1>
      <p className="mb-8 text-sm text-slate-500">餐廳今日狀況一覽</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card href="/admin/employees" label="在職員工" value={employeeCount} icon={<Users className="h-5 w-5" />} tone="blue" />
        <Card href="/admin/restaurants" label="啟用分店" value={activeRestaurantCount} icon={<Building2 className="h-5 w-5" />} tone="blue" />
        <Card href="/admin/attendance" label="今日打卡次數" value={todayPunchCount} icon={<ClipboardList className="h-5 w-5" />} tone="green" />
        <Card href="/admin/attendance" label="目前在崗" value={onShift} icon={<Users className="h-5 w-5" />} tone={onShift > 0 ? "amber" : "blue"} />
      </div>
    </main>
  );
}

const tones = {
  blue: { icon: "bg-ios-blue/15 text-ios-blue", value: "text-slate-900" },
  amber: { icon: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400", value: "text-amber-600 dark:text-amber-400" },
  green: { icon: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", value: "text-slate-900" },
};

function Card({
  href,
  label,
  value,
  icon,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: keyof typeof tones;
}) {
  const t = tones[tone];
  return (
    <Link href={href} className="group">
      <GlassCard variant="strong" hoverable className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${t.icon}`}>{icon}</div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 text-sm text-slate-500">{label}</div>
        <div className={`mt-1 text-4xl font-bold tracking-tight ${t.value}`}>{value}</div>
      </GlassCard>
    </Link>
  );
}
