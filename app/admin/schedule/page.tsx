import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeWeekRange } from "@/lib/tz";
import { GlassCard } from "@/components/glass-card";
import { ScheduleEditor } from "./schedule-editor";

export const dynamic = "force-dynamic";

type Search = { week?: string };

export default async function AdminSchedulePage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "MANAGER") redirect("/");

  const sp = await searchParams;
  const baseDate = sp.week ? new Date(`${sp.week}T00:00:00+08:00`) : new Date();
  const week = tpeWeekRange(baseDate);

  const [users, shifts] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true, employeeNo: true, department: true },
      orderBy: [{ department: "asc" }, { employeeNo: "asc" }],
    }),
    prisma.shiftAssignment.findMany({
      where: { date: { gte: week.start, lt: week.end } },
    }),
  ]);

  const shiftMap = new Map<string, { id: string; startTime: string | null; endTime: string | null; note: string | null; isPublished: boolean }>();
  for (const s of shifts) {
    const dateStr = new Date(s.date.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);
    shiftMap.set(`${s.userId}|${dateStr}`, {
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      note: s.note,
      isPublished: s.publishedAt != null,
    });
  }

  const fmt = (d: Date) =>
    new Date(d.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);
  const prevWeek = new Date(week.start.getTime() - 7 * 24 * 60 * 60_000);
  const nextWeek = new Date(week.start.getTime() + 7 * 24 * 60 * 60_000);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/schedule" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回班表
        </Link>
        <div className="flex gap-2">
          <Link href={`?week=${fmt(prevWeek)}`} className="btn-ghost">← 上週</Link>
          <Link href={`?week=${fmt(nextWeek)}`} className="btn-ghost">下週 →</Link>
        </div>
      </div>

      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Calendar className="h-6 w-6" />
          編輯每週班表
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {week.days[0]} ~ {week.days[6]} · 設定每位員工每日的上下班時間，「發佈」後員工才看得到
        </p>
      </header>

      <GlassCard variant="strong" className="p-3">
        <ScheduleEditor
          weekStart={week.days[0]}
          days={week.days}
          users={users.map((u) => ({ ...u }))}
          initialShifts={Object.fromEntries(shiftMap.entries())}
        />
      </GlassCard>
    </main>
  );
}
