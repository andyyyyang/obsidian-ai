"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { OfficeOccupant, PixelOffice } from "@/components/pixel-office";

const IDLE_MS = 30_000;
const REFRESH_MS = 30_000;

const EXCLUDED_PATHS = ["/login", "/clock"];

export function IdleScreensaver() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [occupants, setOccupants] = useState<OfficeOccupant[]>([]);
  const [enabled, setEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 在被排除頁面停用
  useEffect(() => {
    setEnabled(!EXCLUDED_PATHS.some((p) => pathname?.startsWith(p)));
  }, [pathname]);

  // 偵測閒置
  useEffect(() => {
    if (!enabled) return;
    function reset() {
      if (active) setActive(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActive(true), IDLE_MS);
    }
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, enabled]);

  // active 時抓 occupants 並定期 refresh
  useEffect(() => {
    if (!active || !enabled) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/attendance/online", { cache: "no-store" });
        if (res.status === 401) {
          setActive(false);
          setEnabled(false);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.occupants)) {
          setOccupants(data.occupants);
        }
      } catch {
        // 忽略
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [active, enabled]);

  if (!active || !enabled) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-md"
      style={{ animation: "fade-in 0.6s ease-out" }}
    >
      <div className="mb-4 text-center text-white">
        <div className="mb-1 text-xs uppercase tracking-[0.3em] text-white/40">Office Mode</div>
        <h2 className="text-2xl font-bold">{getGreeting()}</h2>
        <p className="mt-1 text-sm text-white/60">移動滑鼠或按任意鍵繼續工作</p>
      </div>

      <div className="w-full max-w-5xl px-6">
        <div className="rounded-2xl border-4 border-amber-900/60 bg-black/40 p-2 shadow-2xl">
          <PixelOffice occupants={occupants} scale={3} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
        <Pulse />
        <span>{occupants.length} 位同事在辦公室</span>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "夜深了，要早點休息";
  if (h < 12) return "早安，又是元氣滿滿的一天";
  if (h < 14) return "午安";
  if (h < 18) return "下午加油";
  return "辛苦了一天";
}

function Pulse() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}
