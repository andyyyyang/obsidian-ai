"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, MapPin, Crosshair } from "lucide-react";
import { toast } from "sonner";

type Office = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  ipWhitelist: string | null;
  active: boolean;
};

export function OfficeManager({ initialOffices }: { initialOffices: Office[] }) {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>(initialOffices);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Partial<Office>>({ radiusMeters: 200 });

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft({ ...draft, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast.success("已抓取目前位置");
      },
      () => toast.error("無法取得位置"),
    );
  }

  function createOffice() {
    if (!draft.name) {
      toast.error("請填地點名稱");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/offices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        toast.error("新增失敗");
        return;
      }
      toast.success("已新增");
      setDraft({ radiusMeters: 200 });
      router.refresh();
    });
  }

  function deleteOffice(id: string) {
    if (!confirm("確定刪除？已有打卡紀錄會保留但失去關聯。")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/offices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("刪除失敗");
        return;
      }
      setOffices(offices.filter((o) => o.id !== id));
      router.refresh();
    });
  }

  return (
    <div>
      <ul className="mb-6 space-y-2">
        {offices.map((o) => (
          <li key={o.id} className="glass-subtle flex items-center justify-between rounded-2xl px-4 py-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-slate-500">
                  {o.address ?? "—"} ·{" "}
                  {o.latitude != null && o.longitude != null
                    ? `(${o.latitude.toFixed(4)}, ${o.longitude.toFixed(4)}) ${o.radiusMeters}m`
                    : "未設 GPS"}
                  {o.ipWhitelist ? ` · IP: ${o.ipWhitelist}` : ""}
                </div>
              </div>
            </div>
            <button onClick={() => deleteOffice(o.id)} className="text-rose-500 hover:text-rose-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {offices.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            尚未設定任何地點
          </li>
        )}
      </ul>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-3 text-sm font-semibold">新增辦公地點</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="input" placeholder="名稱（例：台北總部）" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input className="input" placeholder="地址（選填）" value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          <input className="input" type="number" step="0.0001" placeholder="緯度" value={draft.latitude ?? ""} onChange={(e) => setDraft({ ...draft, latitude: e.target.value === "" ? null : Number(e.target.value) })} />
          <input className="input" type="number" step="0.0001" placeholder="經度" value={draft.longitude ?? ""} onChange={(e) => setDraft({ ...draft, longitude: e.target.value === "" ? null : Number(e.target.value) })} />
          <input className="input" type="number" placeholder="允許半徑（公尺）" value={draft.radiusMeters ?? 200} onChange={(e) => setDraft({ ...draft, radiusMeters: Number(e.target.value) })} />
          <input className="input" placeholder="IP 白名單（CSV，選填）" value={draft.ipWhitelist ?? ""} onChange={(e) => setDraft({ ...draft, ipWhitelist: e.target.value })} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={useMyLocation} className="btn-ghost">
            <Crosshair className="h-4 w-4" />
            使用目前位置
          </button>
          <button onClick={createOffice} disabled={pending} className="btn-primary">
            <Plus className="h-4 w-4" />
            新增
          </button>
        </div>
      </div>
    </div>
  );
}
