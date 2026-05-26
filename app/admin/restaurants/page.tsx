import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/glass-card";
import { PageHeader } from "@/components/page-header";
import { RestaurantManager } from "./restaurant-manager";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        title="分店設定"
        subtitle="設定每間分店的位置範圍 — 員工只能在範圍內打卡"
      />
      <GlassCard variant="strong" className="p-6">
        <RestaurantManager
          initialRestaurants={restaurants.map((r) => ({
            id: r.id,
            name: r.name,
            address: r.address ?? "",
            latitude: r.latitude,
            longitude: r.longitude,
            radiusMeters: r.radiusMeters,
            ipWhitelist: r.ipWhitelist ?? "",
            active: r.active,
          }))}
        />
      </GlassCard>
    </main>
  );
}
