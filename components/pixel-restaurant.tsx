"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildMapleAvatarUrl, MapleLook } from "@/lib/maple-avatar";
import {
  drawBarStool,
  drawCounter,
  drawDiningChair,
  drawDiningTable,
  drawEntryDoor,
  drawEspresso,
  drawFridge,
  drawMenuBoard,
  drawOven,
  drawPendantLamp,
  drawRegister,
  drawRestPlant,
  drawRestWall,
  drawRestWindow,
  drawTileFloor,
  drawWallClock,
  drawWineRack,
} from "@/lib/pixel-restaurant";

export type RestaurantOccupant = {
  id: string;
  name: string;
  look: MapleLook;
  version?: string;
  statusMessage?: string | null;
  onBreak?: boolean;
  isSelf?: boolean;
};

type CharSprite = {
  occupant: RestaurantOccupant;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  flip: boolean;
  walking: boolean;
  idleTimer: number;
};

// 邏輯解析度（像素，未放大）
const LOGICAL_W = 400;
const LOGICAL_H = 220;
const WALL_BOTTOM = 96;
const FLOOR_TOP = WALL_BOTTOM + 8;
const FLOOR_BOTTOM = LOGICAL_H - 8;
const FLOOR_LEFT = 8;
const FLOOR_RIGHT = LOGICAL_W - 8;

export function PixelRestaurant({
  occupants,
  scale = 2,
  className,
  showNames = true,
}: {
  occupants: RestaurantOccupant[];
  scale?: number;
  className?: string;
  showNames?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spritesRef = useRef<CharSprite[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const [, setTick] = useState(0);

  // 維持同 id 角色的位置（避免每次 props 變動跳動）
  useEffect(() => {
    const prev = new Map(spritesRef.current.map((s) => [s.occupant.id, s] as const));
    spritesRef.current = occupants.map((o, i) => {
      const existing = prev.get(o.id);
      if (existing) return { ...existing, occupant: o };
      const startX = FLOOR_LEFT + 24 + ((i * 47) % (FLOOR_RIGHT - FLOOR_LEFT - 48));
      const startY = FLOOR_TOP + 12 + ((i * 19) % (FLOOR_BOTTOM - FLOOR_TOP - 30));
      return {
        occupant: o,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        speed: 0.25 + Math.random() * 0.25,
        flip: false,
        walking: false,
        idleTimer: 1 + Math.random() * 3,
      };
    });
  }, [occupants]);

  // 繪餐廳場景 + 角色運動 loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    canvas.width = LOGICAL_W * scale;
    canvas.height = LOGICAL_H * scale;

    function tone(): "day" | "evening" | "night" {
      const h = new Date().getHours();
      if (h >= 18 || h < 6) return "night";
      if (h >= 16) return "evening";
      return "day";
    }

    function renderScene(currentTone: "day" | "evening" | "night") {
      // 牆
      drawRestWall(ctx!, 0, 0, LOGICAL_W * scale, WALL_BOTTOM * scale, scale, currentTone);
      // 地板
      drawTileFloor(
        ctx!,
        0,
        WALL_BOTTOM * scale,
        LOGICAL_W * scale,
        (LOGICAL_H - WALL_BOTTOM) * scale,
        scale,
      );

      // 牆上裝飾
      drawRestWindow(ctx!, 24 * scale, 16 * scale, scale, { tone: currentTone });
      drawRestWindow(ctx!, 96 * scale, 16 * scale, scale, { tone: currentTone });
      drawMenuBoard(ctx!, 176 * scale, 8 * scale, scale);
      drawRestWindow(ctx!, 240 * scale, 16 * scale, scale, { tone: currentTone });
      drawRestWindow(ctx!, 312 * scale, 16 * scale, scale, { tone: currentTone });
      drawWallClock(ctx!, 366 * scale, 22 * scale, scale);

      drawEntryDoor(ctx!, 372 * scale, 60 * scale, scale);

      drawCounter(ctx!, 8 * scale, 80 * scale, scale);
      drawRegister(ctx!, 280 * scale, 70 * scale, scale);

      drawOven(ctx!, 8 * scale, 56 * scale, scale);
      drawEspresso(ctx!, 64 * scale, 60 * scale, scale);
      drawFridge(ctx!, 108 * scale, 50 * scale, scale);
      drawWineRack(ctx!, 144 * scale, 50 * scale, scale);

      // 上排桌
      drawDiningTable(ctx!, 24 * scale, 130 * scale, scale);
      drawDiningChair(ctx!, 18 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 50 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 18 * scale, 150 * scale, scale);
      drawDiningChair(ctx!, 50 * scale, 150 * scale, scale);

      drawDiningTable(ctx!, 104 * scale, 130 * scale, scale);
      drawDiningChair(ctx!, 98 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 130 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 98 * scale, 150 * scale, scale);
      drawDiningChair(ctx!, 130 * scale, 150 * scale, scale);

      drawDiningTable(ctx!, 184 * scale, 130 * scale, scale);
      drawDiningChair(ctx!, 178 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 210 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 178 * scale, 150 * scale, scale);
      drawDiningChair(ctx!, 210 * scale, 150 * scale, scale);

      drawDiningTable(ctx!, 264 * scale, 175 * scale, scale);
      drawDiningChair(ctx!, 258 * scale, 167 * scale, scale);
      drawDiningChair(ctx!, 290 * scale, 167 * scale, scale);
      drawDiningChair(ctx!, 258 * scale, 195 * scale, scale);
      drawDiningChair(ctx!, 290 * scale, 195 * scale, scale);

      drawBarStool(ctx!, 30 * scale, 100 * scale, scale);
      drawBarStool(ctx!, 60 * scale, 100 * scale, scale);
      drawBarStool(ctx!, 90 * scale, 100 * scale, scale);

      drawRestPlant(ctx!, 332 * scale, 178 * scale, scale);

      drawPendantLamp(ctx!, 60 * scale, 0, scale);
      drawPendantLamp(ctx!, 200 * scale, 0, scale);
      drawPendantLamp(ctx!, 340 * scale, 0, scale);

      // 夜間覆蓋
      if (currentTone === "night") {
        ctx!.fillStyle = "rgba(60, 30, 10, 0.18)";
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      } else if (currentTone === "evening") {
        ctx!.fillStyle = "rgba(255, 160, 80, 0.08)";
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    function step(time: number) {
      const dt = lastRef.current ? Math.min(0.05, (time - lastRef.current) / 1000) : 0.016;
      lastRef.current = time;
      const currentTone = tone();

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      renderScene(currentTone);

      // 角色運動 (位置算邏輯，繪圖在 DOM 上層)
      let anyMoved = false;
      for (const s of spritesRef.current) {
        s.idleTimer -= dt;
        if (s.idleTimer <= 0) {
          s.targetX = FLOOR_LEFT + 30 + Math.random() * (FLOOR_RIGHT - FLOOR_LEFT - 60);
          s.targetY = FLOOR_TOP + 16 + Math.random() * (FLOOR_BOTTOM - FLOOR_TOP - 36);
          s.idleTimer = 3 + Math.random() * 5;
        }
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const nx = dx / dist;
          const ny = dy / dist;
          const move = s.speed * dt * 60;
          s.x += nx * move;
          s.y += ny * move;
          s.flip = nx < 0;
          s.walking = true;
          anyMoved = true;
        } else {
          s.walking = false;
        }
      }

      if (anyMoved) setTick((t) => (t + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scale]);

  // 預先建好每個角色的 URL（避免每幀 rebuild）
  const characterUrls = useMemo(() => {
    return new Map(
      occupants.map((o) => [
        o.id,
        {
          stand: buildMapleAvatarUrl(o.look, {
            version: o.version,
            stance: "stand1",
            frame: 0,
            resize: 1,
          }),
          standFlipped: buildMapleAvatarUrl(o.look, {
            version: o.version,
            stance: "stand1",
            frame: 0,
            resize: 1,
            flipX: true,
          }),
        },
      ]),
    );
  }, [occupants]);

  // 角色 DOM 浮層
  // 容器寬度 = canvas 寬度，所以位置直接用 x*scale
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block", width: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={{ imageRendering: "pixelated", display: "block", width: "100%", height: "auto" }}
      />
      {/* 角色浮層 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {spritesRef.current.map((s) => {
          const url = characterUrls.get(s.occupant.id);
          if (!url) return null;
          // 容器自動 stretch 到實際顯示尺寸；我們算的座標是邏輯座標，要轉成 % 才能跟 canvas 同步縮放
          const xPct = (s.x / LOGICAL_W) * 100;
          const yPct = ((s.y - 28) / LOGICAL_H) * 100; // 往上 28px 對齊腳底
          return (
            <div
              key={s.occupant.id}
              style={{
                position: "absolute",
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: "translate(-50%, 0)",
                opacity: s.occupant.onBreak ? 0.55 : 1,
                transition: "opacity 0.4s",
                filter: s.occupant.isSelf ? "drop-shadow(0 0 4px #fbbf24)" : undefined,
              }}
            >
              {showNames && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-14px",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontSize: "10px",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.occupant.name}
                </div>
              )}
              {s.occupant.statusMessage && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-32px",
                    transform: "translateX(-50%)",
                    background: "#fffbe6",
                    color: "#1a1410",
                    border: "1px solid #1a1410",
                    fontSize: "9px",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    maxWidth: "180px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.occupant.statusMessage}
                </div>
              )}
              <img
                src={s.flip ? url.standFlipped : url.stand}
                alt={s.occupant.name}
                style={{
                  imageRendering: "pixelated",
                  display: "block",
                  transform: `scale(${scale * 0.6})`,
                  transformOrigin: "top center",
                }}
                onError={(e) => {
                  // 載失敗就消失（避免顯示破圖）
                  e.currentTarget.style.display = "none";
                }}
              />
              {s.occupant.isSelf && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-52px",
                    transform: "translateX(-50%)",
                    fontSize: "16px",
                    color: "#fbbf24",
                    textShadow: "0 0 4px #000",
                  }}
                >
                  ▼
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
