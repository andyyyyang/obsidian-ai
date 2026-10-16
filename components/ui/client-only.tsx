"use client";
import { useEffect, useState } from "react";

/**
 * ClientOnly — 統一「只在 client 端渲染」的 pattern
 *
 * 用途：
 * - 避免 SSR mismatch（如 next-themes / 讀 localStorage 的元件）
 * - 包裝 browser-only API（Three.js、Canvas、Geolocation 等）
 *
 * 比 next/dynamic({ ssr: false }) 輕量，且可在 server component 內使用
 * （因為自己是 "use client"）。
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
