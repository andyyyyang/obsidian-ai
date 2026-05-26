"use client";

import { useEffect, useRef, useState } from "react";
import { buildMapleAvatarUrl, MapleLook } from "@/lib/maple-avatar";
import { buildMapleMapUrl, RESTAURANT_MAPS } from "@/lib/maple-maps";

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

/**
 * 餐廳場景：以 maplestory.io 的真實楓谷地圖為背景，
 * 員工角色作為絕對定位 <img> 浮層在地圖上隨機走動。
 */
export function MapleRestaurant({
  occupants,
  mapId,
  className,
  showNames = true,
  showMapSelector = false,
}: {
  occupants: RestaurantOccupant[];
  mapId?: number;
  className?: string;
  showNames?: boolean;
  showMapSelector?: boolean;
}) {
  // 從 localStorage 還原使用者選的地圖（若沒指定）
  const [selectedMapIdx, setSelectedMapIdx] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("maple-map-idx");
      if (saved) return Number(saved);
    }
    return 0;
  });
  const activeMapId = mapId ?? RESTAURANT_MAPS[selectedMapIdx]?.id ?? RESTAURANT_MAPS[0].id;
  const [mapLoadError, setMapLoadError] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("maple-map-idx", String(selectedMapIdx));
    setMapLoadError(false);
  }, [selectedMapIdx]);

  const mapUrl = buildMapleMapUrl(activeMapId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spritesRef = useRef<CharSprite[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const [, setTick] = useState(0);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1200, h: 600 });

  // 量測容器尺寸（用於把邏輯座標換成 %）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // sprite 位置 — 保留同 id 角色不跳動
  useEffect(() => {
    const prev = new Map(spritesRef.current.map((s) => [s.occupant.id, s] as const));
    spritesRef.current = occupants.map((o, i) => {
      const existing = prev.get(o.id);
      if (existing) return { ...existing, occupant: o };
      // 邏輯座標 0~100 (% 化)
      const startX = 15 + ((i * 19) % 70);
      const startY = 55 + ((i * 11) % 35);
      return {
        occupant: o,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        speed: 3 + Math.random() * 4,  // % per second
        flip: false,
        walking: false,
        idleTimer: 1 + Math.random() * 3,
      };
    });
  }, [occupants]);

  // 移動 loop
  useEffect(() => {
    function step(time: number) {
      const dt = lastRef.current ? Math.min(0.05, (time - lastRef.current) / 1000) : 0.016;
      lastRef.current = time;
      let anyMoved = false;
      for (const s of spritesRef.current) {
        s.idleTimer -= dt;
        if (s.idleTimer <= 0) {
          // 在地板區域內隨機選新目標 (Y: 50~88 是地板區)
          s.targetX = 10 + Math.random() * 78;
          s.targetY = 50 + Math.random() * 38;
          s.idleTimer = 3 + Math.random() * 6;
        }
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.5) {
          const nx = dx / dist;
          const ny = dy / dist;
          const move = s.speed * dt;
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
  }, []);

  return (
    <div className={className}>
      {/* 地圖選擇器 */}
      {showMapSelector && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-slate-500">地圖：</span>
          <select
            className="rounded-xl border border-slate-200 bg-white/70 px-2 py-1 text-xs"
            value={selectedMapIdx}
            onChange={(e) => setSelectedMapIdx(Number(e.target.value))}
          >
            {RESTAURANT_MAPS.map((m, i) => (
              <option key={m.id} value={i}>{m.name} — {m.hint}</option>
            ))}
          </select>
          {mapLoadError && (
            <span className="text-rose-600">⚠ 此地圖載入失敗，建議切換</span>
          )}
        </div>
      )}

      {/* 場景容器 */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl bg-slate-100"
        style={{ aspectRatio: "16 / 7", minHeight: 360 }}
      >
        {/* 楓谷地圖背景 */}
        <img
          src={mapUrl}
          alt="restaurant map"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
          onError={() => setMapLoadError(true)}
          onLoad={() => setMapLoadError(false)}
        />

        {/* 載入失敗 fallback */}
        {mapLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100">
            <div className="text-center text-sm text-slate-600">
              <div className="mb-2 text-3xl">🍜</div>
              地圖 #{activeMapId} 無法載入
              {showMapSelector && <div className="mt-1 text-xs text-slate-400">請從上方下拉切換另一張</div>}
            </div>
          </div>
        )}

        {/* 角色 sprite 浮層 */}
        {spritesRef.current.map((s) => {
          const url = buildMapleAvatarUrl(s.occupant.look, {
            version: s.occupant.version,
            stance: "stand1",
            frame: 0,
            resize: 1,
            flipX: s.flip,
          });
          return (
            <div
              key={s.occupant.id}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: "translate(-50%, -100%)",
                opacity: s.occupant.onBreak ? 0.55 : 1,
                transition: "opacity 0.4s",
                pointerEvents: "none",
                filter: s.occupant.isSelf ? "drop-shadow(0 0 6px #fbbf24)" : "drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
              }}
            >
              {showNames && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "-14px",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.72)",
                    color: "#fff",
                    fontSize: "11px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    fontFamily: "'PingFang TC', monospace",
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
                  height: Math.max(60, Math.min(120, containerSize.h * 0.18)),
                  width: "auto",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
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
                    animation: "bounce 1.2s ease-in-out infinite",
                  }}
                >
                  ▼
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
