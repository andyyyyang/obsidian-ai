"use client";

import { useState, useMemo } from "react";

// 來自 MapleStory-Archive/PSSB-Bot 已驗證可用的 item ID 組合
type Preset = { label: string; version: string; items: { id: number; version?: string; animationName?: string }[] };

const PRESETS: Preset[] = [
  {
    label: "PSSB 範例 (預設男 + 整套裝)",
    version: "222",
    items: [
      { id: 2012 },     // body / head
      { id: 12012 },    // skin
      { id: 27038 },    // face
      { id: 47547 },    // hair
      { id: 1053650 },  // overall (連身)
      { id: 1012672 },  // face accessory
      { id: 1005668 },  // hat
    ],
  },
  {
    label: "PSSB 範例 2 (上下分離 + 武器)",
    version: "223",
    items: [
      { id: 2000, version: "220" },
      { id: 12000, version: "220" },
      { id: 60000, version: "223" },
      { id: 50047, version: "223" },
      { id: 1042129, version: "223" },  // top
      { id: 1062112, version: "223" },  // bottom
      { id: 1012636, version: "223", animationName: "default" },  // eye acc
    ],
  },
  {
    label: "極簡（只 body + skin + 頭）",
    version: "222",
    items: [
      { id: 2000 },
      { id: 12000 },
    ],
  },
  {
    label: "戴帽 + 衣服 + 武器",
    version: "222",
    items: [
      { id: 2000 },
      { id: 12000 },
      { id: 1005668 },
      { id: 1053650 },
    ],
  },
];

const STANCES = ["stand1", "stand2", "walk1", "walk2", "alert", "fly", "jump", "sit", "ladder", "rope"] as const;

function buildUrl(preset: Preset, stance: string, frame: number, resize: number, flipX: boolean): string {
  const itemsJson = preset.items
    .map((it) => {
      const obj: Record<string, string | number> = { itemId: it.id, version: it.version ?? preset.version };
      if (it.animationName) obj.animationName = it.animationName;
      return encodeURIComponent(JSON.stringify(obj));
    })
    .join(",");
  const q = new URLSearchParams({
    showears: "false",
    showLefEars: "false",
    resize: String(resize),
    flipX: String(flipX),
    bgColor: "0,0,0,0",
  });
  return `https://maplestory.io/api/character/${itemsJson}/${stance}/${frame}?${q}`;
}

export default function MapleTest() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [stance, setStance] = useState<string>("stand1");
  const [frame, setFrame] = useState<number>(0);
  const [resize, setResize] = useState<number>(3);
  const [flipX, setFlipX] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [errCount, setErrCount] = useState(0);
  const [lastErrTime, setLastErrTime] = useState<string>("");

  const preset = PRESETS[presetIdx];
  const url = useMemo(() => buildUrl(preset, stance, frame, resize, flipX), [preset, stance, frame, resize, flipX]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
        MapleStory.io 連線測試 (v2 — 正確的 URL 格式)
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        這次用 <a className="text-blue-600 underline" href="https://github.com/MapleStory-Archive/PSSB-Bot" target="_blank" rel="noreferrer">PSSB-Bot</a> 驗證過的 JSON-encoded URL 格式 + item ID。<br />
        右下角載出角色 = 成功。錯誤次數爆增 = 還有問題。
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-3 rounded-3xl bg-white/70 p-5 backdrop-blur">
          <Field label="預設組合（PSSB 已驗證可用）">
            <select className="input" value={presetIdx} onChange={(e) => setPresetIdx(Number(e.target.value))}>
              {PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Item 清單">
            <ul className="rounded-xl bg-slate-50 p-3 font-mono text-[11px] text-slate-700">
              {preset.items.map((it, i) => (
                <li key={i}>
                  {`{ "itemId": ${it.id}, "version": "${it.version ?? preset.version}"${it.animationName ? `, "animationName": "${it.animationName}"` : ""} }`}
                </li>
              ))}
            </ul>
          </Field>

          <Field label="Stance">
            <select className="input" value={stance} onChange={(e) => setStance(e.target.value)}>
              {STANCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label={`Frame: ${frame}`}>
            <input type="range" min={0} max={3} value={frame} onChange={(e) => setFrame(Number(e.target.value))} className="w-full" />
          </Field>

          <Field label={`Resize (server-side): ${resize}x`}>
            <input type="range" min={1} max={6} value={resize} onChange={(e) => setResize(Number(e.target.value))} className="w-full" />
          </Field>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={flipX} onChange={(e) => setFlipX(e.target.checked)} />
              flipX (轉身)
            </label>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[10px]">
            <div className="mb-1 font-semibold text-slate-600">完整 URL：</div>
            <a className="break-all text-blue-600 underline" href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-xl p-3 text-xs ${loadCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
              <div className="font-semibold">✓ 載入成功</div>
              <div className="text-2xl font-bold">{loadCount}</div>
            </div>
            <div className={`rounded-xl p-3 text-xs ${errCount > 0 ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-500"}`}>
              <div className="font-semibold">✗ 錯誤</div>
              <div className="text-2xl font-bold">{errCount}</div>
              {lastErrTime && <div className="text-[10px]">最後 {lastErrTime}</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-rose-100 p-6">
          <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">即時預覽</div>
          <div
            className="flex items-center justify-center rounded-2xl bg-white/60 p-4 shadow-inner"
            style={{ minHeight: 280, minWidth: 220 }}
          >
            {/* 用 key 強制換 URL 時重新載入 */}
            <img
              key={url}
              src={url}
              alt="character"
              style={{ imageRendering: "pixelated" }}
              onLoad={() => setLoadCount((n) => n + 1)}
              onError={() => {
                setErrCount((n) => n + 1);
                setLastErrTime(new Date().toLocaleTimeString());
              }}
            />
          </div>
          <p className="mt-3 max-w-[250px] text-center text-[11px] text-slate-500">
            載入慢是正常的（maplestory.io 第一次抓會運算 5~10 秒，CDN 之後就快）
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}
