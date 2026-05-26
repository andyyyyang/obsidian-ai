"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  ipWhitelist: string;
  active: boolean;
};

export function RestaurantManager({ initialRestaurants }: { initialRestaurants: Restaurant[] }) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [pending, startTransition] = useTransition();

  function updateField<K extends keyof Restaurant>(idx: number, key: K, value: Restaurant[K]) {
    const next = [...restaurants];
    next[idx] = { ...next[idx], [key]: value };
    setRestaurants(next);
  }

  function addNew() {
    setRestaurants([
      ...restaurants,
      {
        id: `new-${Date.now()}`,
        name: "",
        address: "",
        latitude: null,
        longitude: null,
        radiusMeters: 200,
        ipWhitelist: "",
        active: true,
      },
    ]);
  }

  function save(idx: number) {
    const r = restaurants[idx];
    const isNew = r.id.startsWith("new-");
    startTransition(async () => {
      const res = await fetch(isNew ? "/api/admin/restaurants" : `/api/admin/restaurants/${r.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: r.name,
          address: r.address || null,
          latitude: r.latitude,
          longitude: r.longitude,
          radiusMeters: r.radiusMeters,
          ipWhitelist: r.ipWhitelist || null,
          active: r.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "儲存失敗");
        return;
      }
      toast.success(`已儲存 ${r.name}`);
      router.refresh();
    });
  }

  function remove(idx: number) {
    const r = restaurants[idx];
    if (r.id.startsWith("new-")) {
      setRestaurants(restaurants.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm(`確定停用「${r.name}」？歷史打卡紀錄仍會保留。`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/restaurants/${r.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("停用失敗");
        return;
      }
      toast.success("已停用");
      router.refresh();
    });
  }

  function useMyLocation(idx: number) {
    if (!navigator.geolocation) {
      toast.error("瀏覽器不支援定位");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = [...restaurants];
        next[idx] = {
          ...next[idx],
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        setRestaurants(next);
        toast.success("已填入當前位置");
      },
      (err) => toast.error(`定位失敗：${err.message}`),
    );
  }

  return (
    <div className="space-y-4">
      {restaurants.map((r, i) => (
        <div key={r.id} className="rounded-2xl border border-white/60 bg-white/50 p-4">
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="分店名稱">
              <input className="input" value={r.name} onChange={(e) => updateField(i, "name", e.target.value)} placeholder="例：忠孝店" />
            </Field>
            <Field label="地址">
              <input className="input" value={r.address} onChange={(e) => updateField(i, "address", e.target.value)} />
            </Field>
            <Field label="緯度">
              <input
                className="input"
                type="number"
                step="0.000001"
                value={r.latitude ?? ""}
                onChange={(e) => updateField(i, "latitude", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="經度">
              <input
                className="input"
                type="number"
                step="0.000001"
                value={r.longitude ?? ""}
                onChange={(e) => updateField(i, "longitude", e.target.value === "" ? null : Number(e.target.value))}
              />
            </Field>
            <Field label="允許半徑（公尺）">
              <input
                className="input"
                type="number"
                min={10}
                max={5000}
                value={r.radiusMeters}
                onChange={(e) => updateField(i, "radiusMeters", Number(e.target.value))}
              />
            </Field>
            <Field label="IP 白名單（CSV，選填）" hint="若有設定，從白名單 IP 打卡可略過 GPS 驗證">
              <input className="input" value={r.ipWhitelist} onChange={(e) => updateField(i, "ipWhitelist", e.target.value)} placeholder="203.0.113.1,203.0.113.2" />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={r.active}
                onChange={(e) => updateField(i, "active", e.target.checked)}
              />
              啟用此分店
            </label>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost text-xs" onClick={() => useMyLocation(i)}>
                使用我目前的位置
              </button>
              <button type="button" className="btn-ghost text-xs text-rose-600" onClick={() => remove(i)} disabled={pending}>
                <Trash2 className="h-3.5 w-3.5" />
                停用
              </button>
              <button type="button" className="btn-primary text-xs" onClick={() => save(i)} disabled={pending}>
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                儲存
              </button>
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="btn-ghost w-full py-3" onClick={addNew}>
        <Plus className="h-4 w-4" />
        新增分店
      </button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
