import { prisma } from "@/lib/prisma";
import { TodayShiftWidget } from "@/components/home-widgets";
import { tpeToday, tpeToUtc } from "@/lib/tz";

export async function TodayShiftWidgetServer({ userId }: { userId: string }) {
  const todayStr = tpeToday();
  const todayUtc = tpeToUtc(todayStr, "00:00");
  const shift = await prisma.shiftAssignment.findFirst({
    where: { userId, date: todayUtc, publishedAt: { not: null } },
    select: { startTime: true, endTime: true, note: true },
  });
  const dateLabel = new Date().toLocaleDateString("zh-TW", {
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Taipei",
  });
  return <TodayShiftWidget shift={shift} dateLabel={dateLabel} />;
}
