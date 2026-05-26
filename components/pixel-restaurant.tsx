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
  look: AvatarLook;
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
  walkPhase: number;
  walkClock: number;
  idleTimer: number;
  bubbleTimer: number;
};

// 邏輯解析度（像素，未放大）
const LOGICAL_W = 400;
const LOGICAL_H = 220;

// 牆面 / 地板分界
const WALL_BOTTOM = 96;
// 員工活動區（廚房 + 外場走道，桌椅之間）
const FLOOR_TOP = WALL_BOTTOM + 8;
const FLOOR_BOTTOM = LOGICAL_H - 8;
const FLOOR_LEFT = 8;
const FLOOR_RIGHT = LOGICAL_W - 8;

export function PixelRestaurant({
  occupants,
  scale = 3,
  className,
  showNames = true,
}: {
  occupants: RestaurantOccupant[];
  scale?: number;
  className?: string;
  showNames?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spritesRef = useRef<CharSprite[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // 維持 occupants 變動時的 sprite map（保留同 id 的位置，避免每次刷新跳動）
  useEffect(() => {
    const prev = new Map(spritesRef.current.map((s) => [s.occupant.id, s] as const));
    spritesRef.current = occupants.map((o, i) => {
      const existing = prev.get(o.id);
      if (existing) {
        return { ...existing, occupant: o };
      }
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
        walkPhase: 0,
        walkClock: 0,
        idleTimer: 1 + Math.random() * 3,
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

      // 大門（牆面右下緣）
      drawEntryDoor(ctx!, 372 * scale, 60 * scale, scale);

      // 吧台（橫跨中段，員工會在這後面準備餐點）
      drawCounter(ctx!, 8 * scale, 80 * scale, scale);
      // 收銀機放吧台右側
      drawRegister(ctx!, 280 * scale, 70 * scale, scale);

      // 廚房設備（吧台後方靠牆）— 因為已經被牆遮住一部分，所以也畫在牆面
      drawOven(ctx!, 8 * scale, 56 * scale, scale);
      drawEspresso(ctx!, 64 * scale, 60 * scale, scale);
      drawFridge(ctx!, 108 * scale, 50 * scale, scale);
      drawWineRack(ctx!, 144 * scale, 50 * scale, scale);

      // 外場（地板上）— 餐桌椅
      // 餐桌組 1
      drawDiningTable(ctx!, 24 * scale, 130 * scale, scale);
      drawDiningChair(ctx!, 18 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 50 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 18 * scale, 150 * scale, scale);
      drawDiningChair(ctx!, 50 * scale, 150 * scale, scale);

      // 餐桌組 2
      drawDiningTable(ctx!, 104 * scale, 130 * scale, scale);
      drawDiningChair(ctx!, 98 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 130 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 98 * scale, 150 * scale, scale);
      drawDiningChair(ctx!, 130 * scale, 150 * scale, scale);

      // 餐桌組 3
      drawDiningTable(ctx!, 184 * scale, 130 * scale, scale);
      drawDiningChair(ctx!, 178 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 210 * scale, 122 * scale, scale);
      drawDiningChair(ctx!, 178 * scale, 150 * scale, scale);
      drawDiningChair(ctx!, 210 * scale, 150 * scale, scale);

      // 餐桌組 4
      drawDiningTable(ctx!, 264 * scale, 175 * scale, scale);
      drawDiningChair(ctx!, 258 * scale, 167 * scale, scale);
      drawDiningChair(ctx!, 290 * scale, 167 * scale, scale);
      drawDiningChair(ctx!, 258 * scale, 195 * scale, scale);
      drawDiningChair(ctx!, 290 * scale, 195 * scale, scale);

      // 吧台座位區（高腳椅）— 顧客視角朝吧台
      drawBarStool(ctx!, 30 * scale, 100 * scale, scale);
      drawBarStool(ctx!, 60 * scale, 100 * scale, scale);
      drawBarStool(ctx!, 90 * scale, 100 * scale, scale);

      // 角落盆栽
      drawRestPlant(ctx!, 332 * scale, 178 * scale, scale);

      // 吊燈（從天花板垂下）
      drawPendantLamp(ctx!, 60 * scale, 0, scale);
      drawPendantLamp(ctx!, 200 * scale, 0, scale);
      drawPendantLamp(ctx!, 340 * scale, 0, scale);
    }

    function step(time: number) {
      const dt = lastRef.current ? Math.min(0.05, (time - lastRef.current) / 1000) : 0.016;
      lastRef.current = time;
      const currentTone = tone();

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // 1. 場景
      renderScene(currentTone);

      // 2. 角色更新（隨機巡邏）
      const sprites = [...spritesRef.current];
      for (const s of sprites) {
        s.idleTimer -= dt;
        s.bubbleTimer -= dt;
        if (s.idleTimer <= 0) {
          s.targetX = FLOOR_LEFT + 20 + Math.random() * (FLOOR_RIGHT - FLOOR_LEFT - 40);
          s.targetY = FLOOR_TOP + 12 + Math.random() * (FLOOR_BOTTOM - FLOOR_TOP - 30);
          s.idleTimer = 3 + Math.random() * 5;
        }
        if (s.bubbleTimer <= -6) {
          if (s.occupant.statusMessage) s.bubbleTimer = 4;
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
          if (s.walkClock > 0.2) {
            s.walkPhase = 1 - s.walkPhase;
            s.walkClock = 0;
          }
        } else {
          s.walkPhase = 0;
        }
      }

      // y 軸由小到大繪製（製造遮擋深度）
      sprites.sort((a, b) => a.y - b.y);

      for (const s of sprites) {
        const px = s.x * scale;
        const py = s.y * scale;
        drawShadow(ctx!, px, py + CHAR_H * scale, CHAR_W * scale);
        if (s.occupant.onBreak) ctx!.globalAlpha = 0.55;
        drawAvatar(ctx!, s.occupant.look, px, py, scale, s.walkPhase, s.flip);
        ctx!.globalAlpha = 1;

        if (showNames) {
          drawNameTag(ctx!, s.occupant.name, px + (CHAR_W * scale) / 2, py - 6 * scale, scale);
        }
        if (s.bubbleTimer > 0 && s.occupant.statusMessage) {
          drawSpeechBubble(
            ctx!,
            s.occupant.statusMessage,
            px + (CHAR_W * scale) / 2,
            py - 16 * scale,
            scale,
          );
        }
        if (s.occupant.isSelf) {
          // 黃色小箭頭指向自己
          ctx!.fillStyle = "#f4c542";
          const ax = px + (CHAR_W * scale) / 2;
          const ay = py - 24 * scale;
          ctx!.fillRect(ax - 2 * scale, ay, 4 * scale, scale);
          ctx!.fillRect(ax - scale, ay + scale, 2 * scale, scale);
          ctx!.fillRect(ax, ay + 2 * scale, scale, scale);
        }
      }

      // 夜間覆蓋（餐廳營業到晚上會點吊燈，所以蓋一層暖光而不是冷藍）
      if (currentTone === "night") {
        ctx!.fillStyle = "rgba(60, 30, 10, 0.18)";
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      } else if (currentTone === "evening") {
        ctx!.fillStyle = "rgba(255, 160, 80, 0.08)";
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
