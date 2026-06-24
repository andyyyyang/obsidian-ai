import { getUpcomingAnniversaries } from "@/lib/widgets";
import { AnniversaryWidget } from "@/components/home-widgets";

export async function AnniversariesWidgetServer() {
  const items = await getUpcomingAnniversaries(14);
  return <AnniversaryWidget items={items} />;
}
