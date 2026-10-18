"use client";

import dynamic from "next/dynamic";

/**
 * three.js 動畫改用 next/dynamic 延遲載入 — 把 ~600KB 的 three bundle 從登入頁
 * 的 initial JS 拆出去，讓登入卡片優先顯示；WebGL 動畫在背景載入完才接管。
 * ssr: false 等同於原本的 ClientOnly 行為。
 */
const DottedSurface = dynamic(
  () => import("@/components/ui/dotted-surface").then((m) => m.DottedSurface),
  { ssr: false, loading: () => null },
);

export function DottedSurfaceClient() {
  return <DottedSurface />;
}
