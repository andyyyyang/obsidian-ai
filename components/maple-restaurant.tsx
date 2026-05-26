"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildMapleAvatarUrl, MapleLook } from "@/lib/maple-avatar";
import { buildMapleMapUrl, DEFAULT_RESTAURANT_MAP_ID } from "@/lib/maple-maps";

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
  x: number;              // % 横向位置
  targetX: number;        // % 目的地
  flip: boolean;
  walking: boolean;
  walkFrame: 0 | 1 | 2;   // walk1 動畫幀
  walkClock: number;      // 換幀計時
  idleTimer: number;
  bobOffset: number;      // 站立時的呼吸 / 走路時的彈跳
};

// 地板 Y 線 — 不同地圖略有差異，數值用 % 表示 (從上往下算)
// 92% 對應大多數楓谷室內地圖被 16:7 裁切後的「底層木地板 / 石板」
const DEFAULT_FLOOR_Y_PCT = 92;
// 角色腳底距離 floor Y 的偏移 (向上)
const SPRITE_FOOT_OFFSET = 0;
// 走路速度 (%/秒)
const WALK_SPEED = 18;
// 走路動畫每幀停留時間
const WALK_FRAME_DURATION = 0.14;

export function MapleRestaurant({
  occupants,
  mapId = DEFAULT_RESTAURANT_MAP_ID,
  floorYPct = DEFAULT_FLOOR_Y_PCT,
  className,
  showNames = true,
}: {
  occupants: RestaurantOccupant[];
  mapId?: number;
  floorYPct?: number;     // 自訂地板 Y%（不同地圖可微調）
  className?: string;
  showNames?: boolean;
}) {
  const mapUrl = buildMapleMapUrl(mapId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spritesRef = useRef<CharSprite[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const [, setTick] = useState(0);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1200, h: 600 });

  // 點擊 / 觸碰目標 — 控制「自己」走過去
  function handleTap(e: React.MouseEvent | React.TouchEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = "touches" in e
      ? (e.touches[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? 0)
      : (e as React.MouseEvent).clientX;
    const xPct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));

    // 找到「我自己」的 sprite，設新目標
    const selfSprite = spritesRef.current.find((s) => s.occupant.isSelf);
    if (selfSprite) {
      selfSprite.targetX = xPct;
      selfSprite.idleTimer = 99999; // 取消下次隨機巡邏
    }
  }

  // 量測容器尺寸
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 初始化 sprite 位置（同 id 保留）
  useEffect(() => {
    const prev = new Map(spritesRef.current.map((s) => [s.occupant.id, s] as const));
    spritesRef.current = occupants.map((o, i) => {
      const existing = prev.get(o.id);
      if (existing) return { ...existing, occupant: o };
      const startX = 12 + ((i * 17) % 76);
      return {
        occupant: o,
        x: startX,
        targetX: startX,
        flip: false,
        walking: false,
        walkFrame: 0,
        walkClock: 0,
        idleTimer: 2 + Math.random() * 4,
        bobOffset: 0,
      };
    });
  }, [occupants]);

  // 主 loop — 角色只在水平軸移動，Y 固定為地板
  useEffect(() => {
    function step(time: number) {
      const dt = lastRef.current ? Math.min(0.05, (time - lastRef.current) / 1000) : 0.016;
      lastRef.current = time;
      let anyChange = false;

      for (const s of spritesRef.current) {
        // 非「我」的角色：隨機巡邏
        if (!s.occupant.isSelf) {
          s.idleTimer -= dt;
          if (s.idleTimer <= 0) {
            s.targetX = 8 + Math.random() * 82;
            s.idleTimer = 4 + Math.random() * 8;
          }
        }
        const dx = s.targetX - s.x;
        const dist = Math.abs(dx);
        if (dist > 0.4) {
          const nx = dx / dist;
          const move = WALK_SPEED * dt;
          s.x += nx * move;
          s.flip = nx < 0;
          s.walking = true;
          s.walkClock += dt;
          if (s.walkClock > WALK_FRAME_DURATION) {
            s.walkFrame = ((s.walkFrame + 1) % 3) as 0 | 1 | 2;
            s.walkClock = 0;
          }
          anyChange = true;
        } else {
          s.walking = false;
          // 站立時也會微微浮動（呼吸）
          s.bobOffset = Math.sin(time / 700 + s.x) * 0.4;
        }
      }
      if (anyChange) setTick((t) => (t + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const charHeight = Math.max(72, Math.min(140, containerSize.h * 0.22));

  return (
    <div className={className}>
      <div
        ref={containerRef}
        onClick={handleTap}
        onTouchStart={handleTap}
        className="relative w-full select-none overflow-hidden rounded-2xl bg-slate-900"
        style={{
          aspectRatio: "16 / 8",
          minHeight: 360,
          cursor: "pointer",
          touchAction: "manipulation",
        }}
      >
        {/* 楓谷地圖背景 — 用 object-cover + 錨點 bottom，
            畫面下方一定是地板，角色才能站對位置 */}
        <img
          src={mapUrl}
          alt="restaurant map"
          className="absolute inset-0 h-full w-full"
          style={{
            imageRendering: "pixelated",
            objectFit: "cover",
            objectPosition: "center bottom",
          }}
          onError={() => setMapLoadError(true)}
          onLoad={() => setMapLoadError(false)}
          draggable={false}
        />

        {/* 載入失敗 fallback */}
        {mapLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100">
            <div className="text-center text-sm text-slate-600">
              <div className="mb-2 text-3xl">🍜</div>
              地圖 #{mapId} 無法載入
            </div>
          </div>
        )}

        {/* 自己角色的「目標位置」指示器 */}
        {(() => {
          const self = spritesRef.current.find((s) => s.occupant.isSelf);
          if (!self || !self.walking) return null;
          return (
            <div
              style={{
                position: "absolute",
                left: `${self.targetX}%`,
                top: `${floorYPct}%`,
                transform: "translate(-50%, -50%)",
                width: 24,
                height: 24,
                pointerEvents: "none",
                animation: "pulse-ring 1s ease-out infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid #fbbf24",
                  background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)",
                }}
              />
            </div>
          );
        })()}

        {/* 角色 sprite — 全部站在地板線上 */}
        {spritesRef.current.map((s) => {
          const stance = s.walking ? "walk1" : "stand1";
          const frame = s.walking ? s.walkFrame : 0;
          const url = buildMapleAvatarUrl(s.occupant.look, {
            version: s.occupant.version,
            stance,
            frame,
            resize: 1,
            flipX: s.flip,
          });
          return (
            <div
              key={s.occupant.id}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${floorYPct + SPRITE_FOOT_OFFSET}%`,
                transform: `translate(-50%, calc(-100% + ${s.bobOffset}px))`,
                opacity: s.occupant.onBreak ? 0.55 : 1,
                transition: "opacity 0.4s",
                pointerEvents: "none",
                filter: s.occupant.isSelf
                  ? "drop-shadow(0 0 6px #fbbf24) drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
                  : "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
              }}
            >
              {showNames && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-14px",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.78)",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    fontFamily: "'PingFang TC', monospace",
                    border: "1px solid rgba(255,255,255,0.15)",
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
                    top: "-36px",
                    transform: "translateX(-50%)",
                    background: "#fffbe6",
                    color: "#1a1410",
                    border: "1.5px solid #1a1410",
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.occupant.statusMessage}
                </div>
              )}
              <img
                src={url}
                alt={s.occupant.name}
                style={{
                  imageRendering: "pixelated",
                  display: "block",
                  height: charHeight,
                  width: "auto",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                draggable={false}
              />
              {s.occupant.isSelf && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-58px",
                    transform: "translateX(-50%)",
                    fontSize: "20px",
                    color: "#fbbf24",
                    textShadow: "0 0 4px #000, 0 0 2px #000",
                    animation: "bounce-arrow 1.2s ease-in-out infinite",
                  }}
                >
                  ▼
                </div>
              )}
            </div>
          );
        })}

        {/* 操作提示 */}
        <div
          className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white/90 backdrop-blur"
          style={{ fontFamily: "'PingFang TC', sans-serif" }}
        >
          👆 點/觸碰地面 — 操控你的角色走過去
        </div>
      </div>

      <style>{`
        @keyframes bounce-arrow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes pulse-ring {
          0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
