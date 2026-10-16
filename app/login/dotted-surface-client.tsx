"use client";

import { ClientOnly } from "@/components/ui/client-only";
import { DottedSurface } from "@/components/ui/dotted-surface";

/**
 * three.js 動畫只在 client 載入，避免 SSR 階段碰到 window/WebGL。
 * 用統一的 ClientOnly 包裝（取代之前 next/dynamic ssr:false 的做法）。
 */
export function DottedSurfaceClient() {
  return (
    <ClientOnly>
      <DottedSurface />
    </ClientOnly>
  );
}
