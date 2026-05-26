import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { tpeDayRange, tpeToday } from "@/lib/tz";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

type SearchParams = { date?: string };

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { date } = await searchParams;
  const targetDate = date ?? tpeToday();
  const { start, end } = tpeDayRange(targetDate);

  const [users, punches] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      orderBy: { employeeNo: "asc" },
      select: { id: true, name: true, employeeNo: true, jobTitle: true },
    }),
    prisma.attendance.findMany({
      where: { punchedAt: { gte: start, lt: end } },
      orderBy: { punchedAt: "asc" },
      include: { restaurant: { select: { name: true } } },
    }),
  ]);

  const punchesByUser = new Map<string, typeof punches>();
  for (const p of punches) {
    const arr = punchesByUser.get(p.userId) ?? [];
    arr.push(p);
    punchesByUser.set(p.userId, arr);
  }

  const rows = users.map((u) => {
    const list = punchesByUser.get(u.id) ?? [];
    const clockIn = list.find((p) => p.type === "CLOCK_IN");
    const clockOut = [...list].reverse().find((p) => p.type === "CLOCK_OUT");
    const last = list[list.length - 1];
    const status: "in" | "break" | "off" | "absent" = clockOut
      ? "off"
      : last?.type === "BREAK_OUT"
        ? "break"
        : clockIn
          ? "in"
          : "absent";

    let workMinutes = 0;
    if (clockIn && clockOut) {
      let breakMs = 0;
      let breakStart: Date | undefined;
      for (const p of list) {
        if (p.type === "BREAK_OUT") breakStart = p.punchedAt;
        if (p.type === "BREAK_IN" && breakStart) {
          breakMs += p.punchedAt.getTime() - breakStart.getTime();
          breakStart = undefined;
        }
      }
      workMinutes = Math.max(0, Math.round((clockOut.punchedAt.getTime() - clockIn.punchedAt.getTime() - breakMs) / 60_000));
    }

    return { ...u, clockIn, clockOut, status, workMinutes, restaurantName: list[0]?.restaurant?.name };
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="今日出勤總覽"
        subtitle={targetDate}
        action={
          <form className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              name="date"
              defaultValue={targetDate}
              className="input !w-auto"
            />
            <button type="submit" className="btn-ghost text-xs">查詢</button>
          </form>
        }
      />

      <GlassCard variant="strong" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <Th>員編</Th>
                <Th>姓名</Th>
                <Th>職稱</Th>
                <Th>上班時間</Th>
                <Th>下班時間</Th>
                <Th>實際工時</Th>
                <Th>分店</Th>
                <Th>狀態</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/40">
                  <Td>{r.employeeNo}</Td>
                  <Td>{r.name}</Td>
                  <Td className="text-xs text-slate-500">{r.jobTitle ?? "—"}</Td>
                  <Td className="tabular-nums">{r.clockIn ? fmt(r.clockIn.punchedAt) : "—"}</Td>
                  <Td className="tabular-nums">{r.clockOut ? fmt(r.clockOut.punchedAt) : "—"}</Td>
                  <Td className="tabular-nums">
                    {r.workMinutes ? `${Math.floor(r.workMinutes / 60)}h ${(r.workMinutes % 60).toString().padStart(2, "0")}m` : "—"}
                  </Td>
                  <Td className="text-xs">{r.restaurantName ?? "—"}</Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </main>
  );
}

function StatusBadge({ status }: { status: "in" | "break" | "off" | "absent" }) {
  const map = {
    in:     { label: "在崗",  cls: "bg-emerald-100 text-emerald-700" },
    break:  { label: "休息中", cls: "bg-amber-100 text-amber-700" },
    off:    { label: "下班",  cls: "bg-slate-100 text-slate-600" },
    absent: { label: "未打卡", cls: "bg-rose-100 text-rose-700" },
  };
  const { label, cls } = map[status];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function fmt(d: Date): string {
  return new Date(d).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Taipei" });
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3.5 ${className}`}>{children}</td>;
}
