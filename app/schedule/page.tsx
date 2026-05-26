import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { tpeWeekRange } from "@/lib/tz";
import { GlassCard } from "@/components/glass-card";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

type Search = { week?: string };

export default async function SchedulePage({ searchParams }: { searchParams: Promise<Search> }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const sp = await searchParams;
  const baseDate = sp.week ? new Date(`${sp.week}T00:00:00+08:00`) : new Date();
  const week = tpeWeekRange(baseDate);
  const isMod = session.role === "ADMIN" || session.role === "MANAGER";

  const shifts = await prisma.shiftAssignment.findMany({
    where: {
      date: { gte: week.start, lt: week.end },
      ...(isMod ? {} : { publishedAt: { not: null } }),
    },
    include: { user: { select: { id: true, name: true, employeeNo: true, department: true } } },
    orderBy: [{ user: { department: "asc" } }, { user: { employeeNo: "asc" } }],
  });

  // 找出該週所有有班的員工 (含自己)
  const userMap = new Map<string, { id: string; name: string; employeeNo: string; department: string | null }>();
  for (const s of shifts) {
    userMap.set(s.userId, s.user);
  }
  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, employeeNo: true, department: true },
  });
  if (me && !userMap.has(me.id)) userMap.set(me.id, me);

  const users = Array.from(userMap.values()).sort((a, b) => {
    if (a.id === session.userId) return -1;
    if (b.id === session.userId) return 1;
    return (a.department ?? "").localeCompare(b.department ?? "") || a.employeeNo.localeCompare(b.employeeNo);
  });

  // 建立查詢表：userId + date(YYYY-MM-DD) -> shift
  const shiftByKey = new Map<string, typeof shifts[number]>();
  for (const s of shifts) {
    const dateStr = new Date(s.date.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);
    shiftByKey.set(`${s.userId}|${dateStr}`, s);
  }

  // 上週 / 下週 connect to URL
  const prevWeek = new Date(week.start.getTime() - 7 * 24 * 60 * 60_000);
  const nextWeek = new Date(week.start.getTime() + 7 * 24 * 60 * 60_000);
  const fmt = (d: Date) =>
    new Date(d.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
        {isMod && (
          <Link href={`/admin/schedule?week=${week.days[0]}`} className="btn-primary">
            <Pencil className="h-4 w-4" />
            編輯班表
          </Link>
        )}
      </div>

      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Calendar className="h-6 w-6" />
            每週班表
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {week.days[0]} ~ {week.days[6]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`?week=${fmt(prevWeek)}`} className="btn-ghost">
            <ChevronLeft className="h-4 w-4" />
            上週
          </Link>
          <Link href={`?week=${fmt(nextWeek)}`} className="btn-ghost">
            下週
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <GlassCard variant="strong" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wide text-slate-500">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left">員工</th>
                {week.days.map((d, i) => (
                  <th key={d} className="px-3 py-3 text-center">
                    <div>{WEEKDAYS[i]}</div>
                    <div className="text-[10px] text-slate-400">{d.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                    本週尚未發佈班表
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={u.id === session.userId ? "bg-blue-50/30" : ""}>
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-white/80 px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {u.name}
                        {u.id === session.userId && (
                          <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white">
                            我
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{u.department ?? "—"}</div>
                    </td>
                    {week.days.map((d) => {
                      const s = shiftByKey.get(`${u.id}|${d}`);
                      return (
                        <td key={d} className="px-2 py-3 text-center align-top">
                          <ShiftCell shift={s} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </main>
  );
}

function ShiftCell({ shift }: { shift?: { startTime: string | null; endTime: string | null; note: string | null; publishedAt: Date | null } }) {
  if (!shift) {
    return <span className="text-slate-300">—</span>;
  }
  const isDraft = !shift.publishedAt;
  if (!shift.startTime || !shift.endTime) {
    return (
      <div className={isDraft ? "opacity-50" : ""}>
        <span className="inline-block rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600">休</span>
        {shift.note && <div className="mt-0.5 text-[10px] text-slate-400">{shift.note}</div>}
      </div>
    );
  }
  return (
    <div className={isDraft ? "opacity-50" : ""}>
      <div className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 tabular-nums">
        {shift.startTime}~{shift.endTime}
      </div>
      {shift.note && <div className="mt-0.5 text-[10px] text-slate-400">{shift.note}</div>}
      {isDraft && <div className="mt-0.5 text-[10px] text-amber-600">草稿</div>}
    </div>
  );
}
