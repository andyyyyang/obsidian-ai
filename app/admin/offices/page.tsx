import Link from "next/link";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { OfficeManager } from "./office-manager";
import { ScheduleManager } from "./schedule-manager";

export const dynamic = "force-dynamic";

export default async function OfficesPage() {
  const [offices, schedules] = await Promise.all([
    prisma.office.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.workSchedule.findMany({ orderBy: { createdAt: "asc" }, include: { office: { select: { name: true } } } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Building2 className="h-6 w-6" />
          辦公地點與班別
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          設定打卡地點 (GPS / IP 白名單) 與標準上下班時間
        </p>
      </div>

      <GlassCard variant="strong" className="mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">辦公地點</h2>
        <OfficeManager initialOffices={offices.map((o) => ({ ...o }))} />
      </GlassCard>

      <GlassCard variant="strong" className="p-6">
        <h2 className="mb-4 text-lg font-semibold">班別</h2>
        <ScheduleManager
          initialSchedules={schedules.map((s) => ({
            id: s.id,
            name: s.name,
            startTime: s.startTime,
            endTime: s.endTime,
            breakMinutes: s.breakMinutes,
            workDays: s.workDays,
            lateGraceMinutes: s.lateGraceMinutes,
            officeId: s.officeId,
            officeName: s.office?.name ?? null,
          }))}
          offices={offices.map((o) => ({ id: o.id, name: o.name }))}
        />
      </GlassCard>
    </main>
  );
}
