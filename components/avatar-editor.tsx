"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Dice5 } from "lucide-react";
import { toast } from "sonner";
import {
  AvatarLook,
  DEFAULT_LOOK,
  HAIR_COLORS,
  PANTS_COLORS,
  SHIRT_COLORS,
  SHOE_COLORS,
  SKIN_TONES,
} from "@/lib/pixel-art";
import { AvatarPreview } from "@/components/avatar-preview";

const HAIR_STYLE_LABELS = ["短髮", "長髮", "雙馬尾", "龐克", "中分"];
const EYE_LABELS = ["普通", "笑眼", "眨眼"];
const HATS = [
  { value: null, label: "無" },
  { value: "cap", label: "棒球帽" },
  { value: "wizard", label: "巫師帽" },
  { value: "santa", label: "聖誕帽" },
  { value: "crown", label: "皇冠" },
];
const GLASSES = [
  { value: null, label: "無" },
  { value: "round", label: "圓框" },
  { value: "square", label: "方框" },
  { value: "sunglasses", label: "墨鏡" },
];

export function AvatarEditor({
  initialLook,
  initialStatus,
  targetUserId,
}: {
  initialLook: AvatarLook;
  initialStatus: string;
  targetUserId?: string;  // 若有 → admin 替別人改
}) {
  const router = useRouter();
  const [look, setLook] = useState<AvatarLook>(initialLook);
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof AvatarLook>(key: K, value: AvatarLook[K]) {
    setLook({ ...look, [key]: value });
  }

  function randomize() {
    setLook({
      skinTone: Math.floor(Math.random() * SKIN_TONES.length),
      hairStyle: Math.floor(Math.random() * HAIR_STYLE_LABELS.length),
      hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
      shirtColor: Math.floor(Math.random() * SHIRT_COLORS.length),
      pantsColor: Math.floor(Math.random() * PANTS_COLORS.length),
      shoeColor: Math.floor(Math.random() * SHOE_COLORS.length),
      eyeStyle: Math.floor(Math.random() * EYE_LABELS.length),
      hat: HATS[Math.floor(Math.random() * HATS.length)].value,
      glasses: GLASSES[Math.floor(Math.random() * GLASSES.length)].value,
      backpack: Math.random() < 0.4,
    });
  }

  function save() {
    const url = targetUserId ? `/api/admin/users/${targetUserId}/avatar` : "/api/me/avatar";
    startTransition(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...look, statusMessage: status }),
      });
      if (!res.ok) {
        toast.error("儲存失敗");
        return;
      }
      toast.success("已儲存外觀");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      {/* 預覽 */}
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-sky-100 to-indigo-100 p-6 dark:from-sky-900/40 dark:to-indigo-900/40">
        <div className="text-xs uppercase tracking-wide text-slate-500">即時預覽</div>
        <div className="rounded-2xl bg-white/60 p-3 shadow-inner">
          <AvatarPreview look={look} scale={6} />
        </div>
        <input
          className="input text-center text-xs"
          maxLength={60}
          placeholder="頭上的話 (選填)"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <div className="flex w-full gap-2">
          <button onClick={randomize} className="btn-ghost flex-1">
            <Dice5 className="h-4 w-4" />
            隨機
          </button>
          <button onClick={save} disabled={pending} className="btn-primary flex-1">
            <Save className="h-4 w-4" />
            儲存
          </button>
        </div>
      </div>

      {/* 設定面板 */}
      <div className="space-y-5">
        <Section label="髮型">
          <OptionRow
            options={HAIR_STYLE_LABELS.map((label, i) => ({ value: i, label }))}
            value={look.hairStyle}
            onChange={(v) => update("hairStyle", v)}
          />
        </Section>

        <Section label="髮色">
          <ColorRow
            colors={HAIR_COLORS.map((c) => c.main)}
            value={look.hairColor}
            onChange={(v) => update("hairColor", v)}
          />
        </Section>

        <Section label="膚色">
          <ColorRow
            colors={SKIN_TONES.map((s) => s.base)}
            value={look.skinTone}
            onChange={(v) => update("skinTone", v)}
          />
        </Section>

        <Section label="表情">
          <OptionRow
            options={EYE_LABELS.map((label, i) => ({ value: i, label }))}
            value={look.eyeStyle}
            onChange={(v) => update("eyeStyle", v)}
          />
        </Section>

        <Section label="上衣顏色">
          <ColorRow
            colors={SHIRT_COLORS.map((c) => c.main)}
            value={look.shirtColor}
            onChange={(v) => update("shirtColor", v)}
          />
        </Section>

        <Section label="褲子顏色">
          <ColorRow
            colors={PANTS_COLORS.map((c) => c.main)}
            value={look.pantsColor}
            onChange={(v) => update("pantsColor", v)}
          />
        </Section>

        <Section label="鞋子顏色">
          <ColorRow
            colors={SHOE_COLORS}
            value={look.shoeColor}
            onChange={(v) => update("shoeColor", v)}
          />
        </Section>

        <Section label="帽子">
          <OptionRow
            options={HATS.map((h) => ({ value: h.value, label: h.label }))}
            value={look.hat}
            onChange={(v) => update("hat", v)}
          />
        </Section>

        <Section label="眼鏡">
          <OptionRow
            options={GLASSES.map((g) => ({ value: g.value, label: g.label }))}
            value={look.glasses}
            onChange={(v) => update("glasses", v)}
          />
        </Section>

        <Section label="背包">
          <OptionRow
            options={[
              { value: false, label: "無" },
              { value: true, label: "有" },
            ]}
            value={look.backpack}
            onChange={(v) => update("backpack", v)}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function ColorRow({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-9 w-9 rounded-xl border-2 transition ${
            value === i ? "scale-110 border-blue-500 shadow" : "border-white/60"
          }`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function OptionRow<T>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o, i) => (
        <button
          key={i}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border px-3 py-1.5 text-sm transition ${
            o.value === value
              ? "border-blue-500 bg-blue-500 text-white shadow"
              : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
