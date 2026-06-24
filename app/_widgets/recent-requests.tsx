import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { StatusBadge } from "@/components/status-badge";

export async function RecentRequestsServer({
  userId,
  showNewButton,
}: {
  userId: string;
  showNewButton: boolean;
}) {
  const recentRequests = await prisma.leaveRequest.findMany({
    where: { requesterId: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <GlassCard variant="strong" className="p-7">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">最近的申請</h2>
        {showNewButton && (
          <Link href="/leave/new" className="btn-primary">
            <Plus className="h-4 w-4 flex-shrink-0" />
            新增申請
          </Link>
        )}
      </div>
      {recentRequests.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">還沒有任何申請紀錄。</div>
      ) : (
        <ul className="space-y-2">
          {recentRequests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/leave/${r.id}`}
                className="glass-subtle glass-hoverable flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {format(r.startDate, "yyyy-MM-dd")}
                    {r.startDate.getTime() !== r.endDate.getTime() &&
                      ` ~ ${format(r.endDate, "yyyy-MM-dd")}`}
                    <span className="ml-2 font-normal text-slate-500">（{r.days} 天）</span>
                  </div>
                  <div className="mt-0.5 text-slate-500">{r.reason}</div>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
