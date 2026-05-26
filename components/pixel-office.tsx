"use client";

import { useEffect, useRef } from "react";
import {
  AvatarLook,
  CHAR_H,
  CHAR_W,
  drawAvatar,
  drawNameTag,
  drawShadow,
  drawSpeechBubble,
} from "@/lib/pixel-art";
import {
  drawBulletin,
  drawCabinet,
  drawChair,
  drawClock,
  drawCoffee,
  drawDesk,
  drawDoor,
  drawFloor,
  drawLamp,
  drawPlant,
  drawPrinter,
  drawSofa,
  drawWall,
  drawWater,
  drawWhiteboard,
  drawWindow,
} from "@/lib/pixel-furniture";

export type OfficeOccupant = {
  id: string;
  name: string;
  look: AvatarLook;
  statusMessage?: string | null;
  onBreak?: boolean;
  isSelf?: boolean;
};

type CharSprite = {
  occupant: OfficeOccupant;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  flip: boolean;
  walkPhase: number;
  walkClock: number;
  idleTimer: number;
  bubbleTimer: number;
};

// 邏輯解析度 (像素，未放大)
const LOGICAL_W = 320;
const LOGICAL_H = 200;
const FLOOR_TOP = 100;
const ROOM_LEFT = 8;
const ROOM_RIGHT = LOGICAL_W - 8;
const ROOM_TOP = FLOOR_TOP + 8;
const ROOM_BOTTOM = LOGICAL_H - 14;

export function PixelOffice({
  occupants,
  scale = 3,
  className,
  showNames = true,
}: {
  occupants: OfficeOccupant[];
  scale?: number;
  className?: string;
  showNames?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<CharSprite[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    spritesRef.current = occupants.map((o, i) => {
      const startX = ROOM_LEFT + 20 + ((i * 35) % (ROOM_RIGHT - ROOM_LEFT - 40));
      const startY = ROOM_TOP + 30 + ((i * 17) % (ROOM_BOTTOM - ROOM_TOP - 30));
      return {
        occupant: o,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        speed: 0.25 + Math.random() * 0.2,
        flip: false,
        walkPhase: 0,
        walkClock: 0,
        idleTimer: Math.random() * 3,
        bubbleTimer: 0,
      };
    });
  }, [occupants]);

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
      // 牆 + 地板
      drawWall(ctx!, 0, 0, LOGICAL_W * scale, FLOOR_TOP * scale, scale, currentTone);
      drawFloor(ctx!, 0, FLOOR_TOP * scale, LOGICAL_W * scale, (LOGICAL_H - FLOOR_TOP) * scale, scale);

      // 牆上裝飾
      drawWindow(ctx!, 30 * scale, 16 * scale, scale, { tone: currentTone });
      drawWindow(ctx!, 110 * scale, 16 * scale, scale, { tone: currentTone });
      drawClock(ctx!, 180 * scale, 24 * scale, scale);
      drawWhiteboard(ctx!, 210 * scale, 20 * scale, scale);
      drawBulletin(ctx!, 264 * scale, 22 * scale, scale);

      // 牆邊家具 (緊貼牆面，z-order 與地板上一致)
      drawDoor(ctx!, 10 * scale, 82 * scale, scale);
      drawCabinet(ctx!, 80 * scale, 88 * scale, scale);
      drawPrinter(ctx!, 100 * scale, 92 * scale, scale);
      drawCoffee(ctx!, 200 * scale, 88 * scale, scale);
      drawWater(ctx!, 218 * scale, 87 * scale, scale);
      drawLamp(ctx!, 260 * scale, 87 * scale, scale);

      // 地板上的家具 (有 z-order — 後面的先畫)
      // 上排
      drawDesk(ctx!, 30 * scale, 110 * scale, scale);
      drawChair(ctx!, 38 * scale, 128 * scale, scale);
      drawDesk(ctx!, 90 * scale, 110 * scale, scale);
      drawChair(ctx!, 98 * scale, 128 * scale, scale);
      drawDesk(ctx!, 160 * scale, 110 * scale, scale);
      drawChair(ctx!, 168 * scale, 128 * scale, scale);
      drawDesk(ctx!, 220 * scale, 110 * scale, scale);
      drawChair(ctx!, 228 * scale, 128 * scale, scale);
      // 盆栽角落
      drawPlant(ctx!, 12 * scale, 130 * scale, scale);
      drawPlant(ctx!, 296 * scale, 130 * scale, scale);
      // 沙發
      drawSofa(ctx!, 130 * scale, 170 * scale, scale);
    }

    function step(time: number) {
      const dt = lastRef.current ? (time - lastRef.current) / 1000 : 0.016;
      lastRef.current = time;
      const currentTone = tone();

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // 1. 場景
      renderScene(currentTone);

      // 2. 角色更新與排序（依 y 軸決定遮擋順序）
      const sprites = [...spritesRef.current];
      for (const s of sprites) {
        s.idleTimer -= dt;
        s.bubbleTimer -= dt;
        if (s.idleTimer <= 0) {
          // 重新選一個隨機目標
          s.targetX = ROOM_LEFT + 20 + Math.random() * (ROOM_RIGHT - ROOM_LEFT - 40);
          s.targetY = ROOM_TOP + 20 + Math.random() * (ROOM_BOTTOM - ROOM_TOP - 30);
          s.idleTimer = 4 + Math.random() * 6;
        }
        if (s.bubbleTimer <= -8) {
          // 偶爾顯示對話泡泡
          if (s.occupant.statusMessage) s.bubbleTimer = 5;
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
          s.walkClock += dt;
          if (s.walkClock > 0.18) {
            s.walkPhase = 1 - s.walkPhase;
            s.walkClock = 0;
          }
        } else {
          s.walkPhase = 0;
        }
      }

      sprites.sort((a, b) => a.y - b.y);

      // 3. 畫角色
      for (const s of sprites) {
        const px = s.x * scale;
        const py = s.y * scale;
        // 陰影
        drawShadow(ctx!, px, py + CHAR_H * scale, CHAR_W * scale);
        // 休息中半透明
        if (s.occupant.onBreak) ctx!.globalAlpha = 0.55;
        drawAvatar(ctx!, s.occupant.look, px, py, scale, s.walkPhase, s.flip);
        ctx!.globalAlpha = 1;
        // 姓名牌
        if (showNames) {
          drawNameTag(ctx!, s.occupant.name, px + (CHAR_W * scale) / 2, py - 6 * scale, scale);
        }
        // 對話泡泡
        if (s.bubbleTimer > 0 && s.occupant.statusMessage) {
          drawSpeechBubble(
            ctx!,
            s.occupant.statusMessage,
            px + (CHAR_W * scale) / 2,
            py - 16 * scale,
            scale,
          );
        }
        // 自己的指示箭頭
        if (s.occupant.isSelf) {
          ctx!.fillStyle = "#f4c542";
          const ax = px + (CHAR_W * scale) / 2;
          const ay = py - 24 * scale;
          ctx!.fillRect(ax - 2 * scale, ay, 4 * scale, scale);
          ctx!.fillRect(ax - scale, ay + scale, 2 * scale, scale);
          ctx!.fillRect(ax, ay + 2 * scale, scale, scale);
        }
      }

      // 4. 夜間光暈覆蓋
      if (currentTone === "night") {
        ctx!.fillStyle = "rgba(20, 30, 60, 0.18)";
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scale, showNames]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated", display: "block", width: "100%", height: "auto" }}
    />
  );
}
