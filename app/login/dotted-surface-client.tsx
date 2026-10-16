"use client";

import dynamic from "next/dynamic";

// 在 client 包裝一層：only load three.js on client，WebGL 失敗不炸整頁
const DottedSurface = dynamic(
  () => import("@/components/ui/dotted-surface").then((m) => m.DottedSurface),
  { ssr: false },
);

export function DottedSurfaceClient() {
  return <DottedSurface />;
}
