"use client";

import { useEffect, useState } from "react";
import { OfficeOccupant, PixelOffice } from "@/components/pixel-office";

export function OfficeView({ initialOccupants }: { initialOccupants: OfficeOccupant[] }) {
  const [occupants, setOccupants] = useState(initialOccupants);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/attendance/online", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data.occupants)) setOccupants(data.occupants);
      } catch {
        // 忽略
      }
    }, 20_000);
    return () => clearInterval(id);
  }, []);

  return <PixelOffice occupants={occupants} scale={3} />;
}
