"use client";

import { useEffect, useState, useTransition } from "react";
import { LogIn, LogOut, Coffee, RotateCcw, MapPin } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "./glass-card";

type Restaurant = { id: string; name: string; latitude: number | null; longitude: number | null };
type Punch = { id: string; type: string; punchedAt: string; restaurantName?: string };

const TYPE_LABEL: Record<string, string> = {
  CLOCK_IN: "上班",
  CLOCK_OUT: "下班",
  BREAK_OUT: "休息",
  BREAK_IN: "回崗",
};

export function PunchCard({
  restaurants,
  initialPunches,
  compact = false,
}: {
  restaurants: Restaurant[];
  initialPunches: Punch[];
  compact?: boolean;
}) {
  const [punches, setPunches] = useState<Punch[]>(initialPunches);
  const [restaurantId, setRestaurantId] = useState<string>(restaurants[0]?.id ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("此瀏覽器不支援定位");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(null);
      },
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const lastByType = new Map<string, Punch>();
  for (const p of punches) lastByType.set(p.type, p);

  const hasClockedIn = lastByType.has("CLOCK_IN");
  const hasClockedOut = lastByType.has("CLOCK_OUT");
  const onBreak =
    lastByType.has("BREAK_OUT") &&
    (!lastByType.get("BREAK_IN") ||
      new Date(lastByType.get("BREAK_OUT")!.punchedAt) >
        new Date(lastByType.get("BREAK_IN")!.punchedAt));

  function doPunch(type: string) {
    if (!restaurantId) {
      toast.error("請先選擇分店");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/attendance/punch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            restaurantId,
            latitude: coords?.lat,
            longitude: coords?.lng,
            userAgent: navigator.userAgent,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "打卡失敗");
          return;
        }
        toast.success(`${TYPE_LABEL[type]}打卡成功${data.distance != null ? `（距離 ${data.distance}m）` : ""}`);
        const refreshed = await fetch("/api/attendance/today", { cache: "no-store" });
        const refreshedJson = await refreshed.json();
        setPunches(refreshedJson.punches);
      } catch {
        toast.error("網路錯誤");
      }
    });
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Taipei",
    });

  return (
    <GlassCard variant="strong" className={compact ? "p-5" : "p-7"}>
      {/* 時鐘 */}
      <div className="mb-5 text-center">
        <div className={compact ? "text-3xl font-bold tabular-nums tracking-tight text-slate-900" : "text-5xl font-bold tabular-nums tracking-tight text-slate-900"}>
          {now.toLocaleTimeString("zh-TW", { hour12: false, timeZone: "Asia/Taipei" })}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {now.toLocaleDateString("zh-TW", { dateStyle: "full", timeZone: "Asia/Taipei" })}
        </div>
      </div>

      {/* 分店選擇 */}
      {restaurants.length > 1 ? (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-slate-500">分店</label>
          <select
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="input"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      ) : restaurants.length === 1 ? (
        <div className="mb-3 text-center text-xs text-slate-500">
          分店：{restaurants[0].name}
        </div>
      ) : null}

      {/* 位置狀態 */}
      <div className="mb-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        {coords ? (
          <span>已取得位置（{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}）</span>
        ) : locError ? (
          <span className="text-rose-600">無法定位：{locError}</span>
        ) : (
          <span>正在取得位置…</span>
        )}
      </div>

      {/* 打卡按鈕 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="btn-success py-5 text-base"
          disabled={pending || hasClockedIn}
          onClick={() => doPunch("CLOCK_IN")}
        >
          <LogIn className="h-5 w-5" />
          上班
        </button>
        <button
          className="btn-primary py-5 text-base"
          disabled={pending || !hasClockedIn}
          onClick={() => doPunch("CLOCK_OUT")}
        >
          <LogOut className="h-5 w-5" />
          下班
        </button>
        <button
          className="btn-ghost py-3"
          disabled={pending || !hasClockedIn || hasClockedOut || onBreak}
          onClick={() => doPunch("BREAK_OUT")}
        >
          <Coffee className="h-4 w-4" />
          休息
        </button>
        <button
          className="btn-ghost py-3"
          disabled={pending || !onBreak}
          onClick={() => doPunch("BREAK_IN")}
        >
          <RotateCcw className="h-4 w-4" />
          回崗
        </button>
      </div>

      {/* 今日打卡紀錄 */}
      <div className="mt-5">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">今日紀錄</h3>
        {punches.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
            還沒打卡，今天從上班開始
          </p>
        ) : (
          <ul className="space-y-1.5">
            {punches.map((p) => (
              <li
                key={p.id}
                className="glass-subtle flex items-center justify-between rounded-2xl px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-900">{TYPE_LABEL[p.type] ?? p.type}</span>
                <span className="tabular-nums text-slate-600">{fmtTime(p.punchedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  );
}
