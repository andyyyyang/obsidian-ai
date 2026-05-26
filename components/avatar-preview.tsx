"use client";

import { useState } from "react";
import { buildMapleAvatarUrl, MapleLook, MapleStance } from "@/lib/maple-avatar";

/**
 * 角色 sprite 預覽 — 直接從 maplestory.io 抓組合好的 PNG
 */
export function AvatarPreview({
  look,
  version,
  stance = "stand1",
  frame = 0,
  resize = 1,
  flipX = false,
  className,
  fallback,
}: {
  look: MapleLook;
  version?: string;
  stance?: MapleStance;
  frame?: number;
  resize?: number;
  flipX?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const url = buildMapleAvatarUrl(look, { version, stance, frame, resize, flipX });

  if (errored) {
    return <>{fallback ?? <span className="text-[10px] text-rose-500">載入失敗</span>}</>;
  }

  return (
    <img
      key={url}
      src={url}
      alt="character"
      className={className}
      style={{
        imageRendering: "pixelated",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.18s ease-out",
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setErrored(true)}
    />
  );
}
