import { getUpcomingBirthdays } from "@/lib/widgets";
import { BirthdayWidget } from "@/components/home-widgets";

export async function BirthdaysWidgetServer() {
  const items = await getUpcomingBirthdays(14);
  return <BirthdayWidget items={items} />;
}
