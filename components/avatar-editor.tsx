"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dice5, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AvatarPreview } from "@/components/avatar-preview";
import {
  buildMapleItemIconUrl,
  MapleLook,
  MapleStance,
} from "@/lib/maple-avatar";
import {
  CATEGORY_LABELS,
  MapleCategoryKey,
  MAPLE_ITEM_CATALOG,
  OUTFIT_PRESETS,
  SKINS,
} from "@/lib/maple-items";

// 哪個分類對應 MapleLook 哪個欄位
const CATEGORY_TO_FIELD: Record<MapleCategoryKey, keyof MapleLook> = {
  face: "faceId",
  hair: "hairId",
  hat: "hatId",
  top: "topId",
  bottom: "bottomId",
  overall: "overallId",
  shoes: "shoesId",
  cape: "capeId",
  gloves: "glovesId",
  weapon: "weaponId",
  faceAccessory: "faceAccessoryId",
  eyeAccessory: "eyeAccessoryId",
  earrings: "earringsId",
};

const CATEGORIES: MapleCategoryKey[] = [
  "hair",
  "face",
  "hat",
  "top",
  "bottom",
  "overall",
  "shoes",
  "cape",
  "gloves",
  "weapon",
  "faceAccessory",
  "eyeAccessory",
  "earrings",
];

const STANCES: { value: MapleStance; label: string }[] = [
  { value: "stand1", label: "站立 1" },
  { value: "stand2", label: "站立 2" },
  { value: "walk1", label: "走路 1" },
  { value: "walk2", label: "走路 2" },
  { value: "alert", label: "驚訝" },
  { value: "jump", label: "跳" },
  { value: "sit", label: "坐" },
];

export function AvatarEditor({
  initialLook,
  initialVersion,
  initialStatus,
}: {
  initialLook: MapleLook;
  initialVersion?: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [look, setLook] = useState<MapleLook>(initialLook);
  const [version] = useState<string>(initialVersion ?? "222");
  const [status, setStatus] = useState(initialStatus);
  const [activeCategory, setActiveCategory] = useState<MapleCategoryKey>("hair");
  const [stance, setStance] = useState<MapleStance>("stand1");
  const [frame, setFrame] = useState(0);
  const [pending, startTransition] = useTransition();

  function selectItem(category: MapleCategoryKey, id: number) {
    const field = CATEGORY_TO_FIELD[category];
    // face / hair 是必選 (number)；其它是 nullable
    const isRequired = field === "faceId" || field === "hairId";
    setLook({
      ...look,
      [field]: isRequired ? id : (id === 0 ? null : id),
    } as MapleLook);
  }

  function selectSkin(idx: number) {
    setLook({ ...look, bodyId: SKINS[idx].bodyId, headId: SKINS[idx].headId });
  }

  function currentSkinIdx(): number {
    return SKINS.findIndex((s) => s.bodyId === look.bodyId);
  }

  function randomize() {
    const cat = MAPLE_ITEM_CATALOG;
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setLook({
      ...look,
      faceId: pick(cat.face).id,
      hairId: pick(cat.hair).id,
      hatId: pickOrNull(cat.hat, 0.5),
      topId: pickOrNull(cat.top, 0.6),
      bottomId: pickOrNull(cat.bottom, 0.6),
      overallId: Math.random() < 0.2 ? pick(cat.overall).id || null : null,
      shoesId: pickOrNull(cat.shoes, 0.5),
      capeId: pickOrNull(cat.cape, 0.25),
      glovesId: pickOrNull(cat.gloves, 0.25),
      weaponId: pickOrNull(cat.weapon, 0.4),
      faceAccessoryId: pickOrNull(cat.faceAccessory, 0.2),
      eyeAccessoryId: pickOrNull(cat.eyeAccessory, 0.3),
      earringsId: pickOrNull(cat.earrings, 0.2),
    });
  }

  function save() {
    startTransition(async () => {
      const res = await fetch("/api/me/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...look, version, statusMessage: status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "儲存失敗");
        return;
      }
      toast.success("已儲存外觀");
      router.refresh();
    });
  }

  const items = MAPLE_ITEM_CATALOG[activeCategory];
  const activeField = CATEGORY_TO_FIELD[activeCategory];
  const currentItemId = (look[activeField] ?? 0) as number;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
      {/* 左：預覽 + 控制 */}
      <div className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-amber-100 to-rose-100 p-4 dark:from-amber-900/30 dark:to-rose-900/30">
          <div className="mb-2 text-center text-xs uppercase tracking-wide text-slate-500">即時預覽</div>
          <div className="flex h-[260px] items-center justify-center rounded-2xl bg-white/50 shadow-inner">
            <AvatarPreview
              look={look}
              version={version}
              stance={stance}
              frame={frame}
              resize={2}
            />
          </div>

          <div className="mt-3 space-y-2">
            <select className="input text-xs" value={stance} onChange={(e) => setStance(e.target.value as MapleStance)}>
              {STANCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <input
              type="range"
              min={0}
              max={3}
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-[11px] text-slate-500">Frame {frame}</div>
          </div>
        </div>

        <input
          className="input"
          maxLength={60}
          placeholder="頭上的氣泡話 (選填)"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />

        <div className="flex gap-2">
          <button onClick={randomize} className="btn-ghost flex-1">
            <Dice5 className="h-4 w-4" />
            隨機
          </button>
          <button onClick={save} disabled={pending} className="btn-primary flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            儲存
          </button>
        </div>
      </div>

      {/* 右：快速套裝 + 分類 tab + 道具網格 */}
      <div>
        {/* 快速套裝 */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            🎁 快速套裝（一鍵變身）
          </div>
          <div className="flex flex-wrap gap-1.5">
            {OUTFIT_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setLook({ ...look, ...p.partial })}
                className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900 transition hover:scale-105 hover:bg-amber-100 hover:shadow"
              >
                <span>{p.emoji}</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 膚色 — 獨立小區 */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">膚色</div>
          <div className="flex gap-2">
            {SKINS.map((s, i) => (
              <button
                key={s.bodyId}
                onClick={() => selectSkin(i)}
                className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                  currentSkinIdx() === i
                    ? "border-amber-500 bg-amber-500 text-white shadow"
                    : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 分類 tabs */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs transition ${
                activeCategory === cat
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white/60 text-slate-600 hover:bg-white"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* item grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {items.map((item) => {
            const selected = item.id === currentItemId || (item.id === 0 && !currentItemId);
            return (
              <button
                key={item.id}
                onClick={() => selectItem(activeCategory, item.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-xs transition ${
                  selected
                    ? "border-amber-500 bg-amber-50 shadow"
                    : "border-slate-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {item.id === 0 ? (
                    <span className="text-[18px] text-slate-300">×</span>
                  ) : (
                    <img
                      src={buildMapleItemIconUrl(item.id, version)}
                      alt={item.name}
                      style={{ imageRendering: "pixelated", maxHeight: 40, maxWidth: 40 }}
                      onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                    />
                  )}
                </div>
                <span className="line-clamp-2 h-8 text-center text-[10px] text-slate-600">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function pickOrNull(arr: readonly { id: number; name: string }[], chance: number): number | null {
  if (Math.random() > chance) return null;
  const candidates = arr.filter((x) => x.id !== 0);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)].id;
}
