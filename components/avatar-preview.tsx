"use client";

import { useEffect, useRef } from "react";
import { AvatarLook, CHAR_H, CHAR_W, drawAvatar } from "@/lib/pixel-art";

export function AvatarPreview({
  look,
  scale = 4,
  animated = true,
  className,
}: {
  look: AvatarLook;
  scale?: number;
  animated?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    canvas.width = CHAR_W * scale;
    canvas.height = (CHAR_H + 4) * scale;

    if (!animated) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAvatar(ctx, look, 0, 2 * scale, scale, 0, false);
      return;
    }

    let frame = 0;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      if (t - last > 350) {
        frame = 1 - frame;
        last = t;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 上下浮動模擬呼吸
      const bob = Math.sin(t / 600) * 1;
      drawAvatar(ctx, look, 0, 2 * scale + bob, scale, frame, false);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [look, scale, animated]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ imageRendering: "pixelated", display: "block" }}
    />
  );
}
