"use client";

import { useEffect, useRef, useState } from "react";
import { buildMapleAvatarUrl, MapleLook } from "@/lib/maple-avatar";
import { buildMapleMapUrl, DEFAULT_RESTAURANT_MAP_ID, getMapPreset } from "@/lib/maple-maps";

export type RestaurantOccupant = {
  id: string;
  name: string;
  look: MapleLook;
  version?: string;
  statusMessage?: string | null;
  onBreak?: boolean;
  isSelf?: boolean;
  onShift?: boolean;
  online?: boolean;
};

type CharSprite = {
  occupant: RestaurantOccupant;
  x: number;              // % 横向位置
  targetX: number;        // % 目的地
  flip: boolean;
  walking: boolean;
  walkFrame: 0 | 1 | 2;
  walkClock: number;
  idleTimer: number;
  bobOffset: number;
  chatBubble: string | null;   // 暫時冒泡 (對話框訊息)
  chatBubbleAt: number;        // 冒泡產生時間 ms
};

const CHAT_BUBBLE_DURATION_MS = 8_000;
// 走路速度 (%/秒)
const WALK_SPEED = 18;
const WALK_FRAME_DURATION = 0.14;

export function MapleRestaurant({
  occupants,
  mapId = DEFAULT_RESTAURANT_MAP_ID,
  floorYPct,
  className,
  showNames = true,
}: {
  occupants: RestaurantOccupant[];
  mapId?: number;
  floorYPct?: number;
  className?: string;
  showNames?: boolean;
}) {
  const preset = getMapPreset(mapId);
  const effectiveFloorY = floorYPct ?? preset.floorYPct;

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

    const selfSprite = spritesRef.current.find((s) => s.occupant.isSelf);
    if (selfSprite) {
      selfSprite.targetX = xPct;
      selfSprite.idleTimer = 99999;
    }
  }

  // 監聽聊天訊息 → 在角色頭上冒泡
  useEffect(() => {
    function onChat(e: Event) {
      const ce = e as CustomEvent<{ authorId: string; content: string }>;
      const sprite = spritesRef.current.find((s) => s.occupant.id === ce.detail.authorId);
      if (sprite) {
        sprite.chatBubble = ce.detail.content;
        sprite.chatBubbleAt = Date.now();
        setTick((t) => (t + 1) % 1_000_000);
      }
    }
    window.addEventListener("chat:new", onChat);
    return () => window.removeEventListener("chat:new", onChat);
  }, []);

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
      const startX = 18 + ((i * 17) % 64);
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
        chatBubble: null,
        chatBubbleAt: 0,
      };
    });
  }, [occupants]);

  // 主 loop
  useEffect(() => {
    function step(time: number) {
      const dt = lastRef.current ? Math.min(0.05, (time - lastRef.current) / 1000) : 0.016;
      lastRef.current = time;
      let anyChange = false;
      const now = Date.now();

      for (const s of spritesRef.current) {
        // 過期的冒泡清掉
        if (s.chatBubble && now - s.chatBubbleAt > CHAT_BUBBLE_DURATION_MS) {
          s.chatBubble = null;
          anyChange = true;
        }

        // 非「我」的角色：隨機巡邏
        if (!s.occupant.isSelf) {
          s.idleTimer -= dt;
          if (s.idleTimer <= 0) {
            s.targetX = 10 + Math.random() * 78;
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
        {/* 楓谷地圖背景 — center bottom 確保地板在畫面下方 */}
        <img
          src={mapUrl}
          alt="map"
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

        {mapLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100">
            <div className="text-center text-sm text-slate-600">
              <div className="mb-2 text-3xl">🌙</div>
              地圖 #{mapId} 無法載入
            </div>
          </div>
        )}

        {/* 目標位置指示器 */}
        {(() => {
          const self = spritesRef.current.find((s) => s.occupant.isSelf);
          if (!self || !self.walking) return null;
          return (
            <div
              style={{
                position: "absolute",
                left: `${self.targetX}%`,
                top: `${effectiveFloorY}%`,
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

        {/* 角色 sprite */}
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

          // 顯示哪個訊息：chatBubble 優先（剛聊天）, 沒有就 statusMessage
          const bubbleText = s.chatBubble ?? s.occupant.statusMessage ?? null;
          const isChatBubble = !!s.chatBubble;

          return (
            <div
              key={s.occupant.id}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${effectiveFloorY}%`,
                transform: `translate(-50%, calc(-100% + ${s.bobOffset}px))`,
                opacity: s.occupant.onBreak ? 0.55 : s.occupant.onShift === false ? 0.78 : 1,
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
                    background: s.occupant.onShift ? "rgba(0,0,0,0.78)" : "rgba(120,90,40,0.78)",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    fontFamily: "'PingFang TC', monospace",
                    border: s.occupant.online
                      ? "1px solid rgba(255,255,255,0.45)"
                      : "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {s.occupant.online && !s.occupant.isSelf && (
                    <span style={{
                      display: "inline-block",
                      width: 6, height: 6,
                      background: "#34d399",
                      borderRadius: "50%",
                      marginRight: 4,
                      boxShadow: "0 0 4px #34d399",
                    }} />
                  )}
                  {s.occupant.name}
                  {!s.occupant.onShift && s.occupant.online && (
                    <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.7 }}>線上</span>
                  )}
                </div>
              )}
              {bubbleText && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-40px",
                    transform: "translateX(-50%)",
                    background: isChatBubble ? "#ffffff" : "#fffbe6",
                    color: "#1a1410",
                    border: isChatBubble ? "2px solid #2563eb" : "1.5px solid #1a1410",
                    fontSize: isChatBubble ? "11px" : "10px",
                    fontWeight: isChatBubble ? 600 : 400,
                    padding: "3px 8px",
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    maxWidth: "240px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    boxShadow: isChatBubble ? "0 4px 12px rgba(37,99,235,0.4)" : "0 2px 4px rgba(0,0,0,0.2)",
                    animation: isChatBubble ? "bubble-pop 0.3s ease-out" : undefined,
                  }}
                >
                  {bubbleText}
                  {/* 小箭頭 */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-6px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: isChatBubble ? "6px solid #2563eb" : "6px solid #1a1410",
                    }}
                  />
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
          👆 點/觸碰地面 走動 · 右下角 💬 發訊息 (頭上會冒泡)
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
        @keyframes bubble-pop {
          0%   { transform: translateX(-50%) scale(0.5); opacity: 0; }
          60%  { transform: translateX(-50%) scale(1.1); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
