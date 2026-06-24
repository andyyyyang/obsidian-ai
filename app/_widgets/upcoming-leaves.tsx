import { getUpcomingLeaves } from "@/lib/widgets";
import { UpcomingLeavesWidget } from "@/components/home-widgets";

export async function UpcomingLeavesWidgetServer() {
  const items = await getUpcomingLeaves(7);
  return <UpcomingLeavesWidget items={items} />;
}
