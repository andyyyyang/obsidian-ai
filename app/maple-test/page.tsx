"use client";

import { useState } from "react";

const REGIONS = ["GMS", "KMS", "TMS", "JMS", "CMS"] as const;
const VERSIONS = ["255", "254", "253", "245", "230", "217", "207"] as const;
const STANCES = ["stand1", "stand2", "walk1", "walk2", "alert", "fly", "jump", "sit"] as const;

const PRESETS: { label: string; items: string }[] = [
  { label: "預設男 / 短髮 / 白T", items: "2000,12000,20000,1040036,1060026,1072039" },
  { label: "預設女 / 長髮 / 洋裝", items: "2000,21031,20001,1050081,1072025" },
  { label: "戰士 / 全套裝備", items: "2000,12000,20000,1003797,1042254,1062165,1072740,1102940,1082695,1402259" },
  { label: "魔法師 / 巫師帽", items: "2000,30030,20001,1002357,1042003,1062007,1072001,1372003" },
  { label: "弓箭手 / 綠衣", items: "2000,30021,20002,1002357,1041002,1061002,1072005,1452002" },
  { label: "海盜 / 帥氣", items: "2000,30200,20003,1002940,1042200,1062200,1072200,1492000" },
  { label: "厨師（自訂）", items: "2000,30030,20000,1003797,1042254,1062165,1072740" },
];

export default function MapleTest() {
  const [region, setRegion] = useState<string>("GMS");
  const [version, setVersion] = useState<string>("255");
  const [items, setItems] = useState<string>(PRESETS[0].items);
  const [stance, setStance] = useState<string>("stand1");
  const [frame, setFrame] = useState<number>(0);
  const [size, setSize] = useState<number>(4);
  const [loadCount, setLoadCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // skin 是第一個 item，剩下的用逗號連
  const url = `https://maplestory.io/api/${region}/${version}/character/${items}/${stance}/${frame}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
        MapleStory.io 連線測試
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        如果右下角能載出楓谷角色 → ✓ 可以開始把現有手繪像素紙娃娃換成真實楓谷角色。<br />
        如果一直壞掉的小圖示 → ✗ 你瀏覽器到 maplestory.io 被擋了，我們得想別的辦法。
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-3 rounded-3xl bg-white/70 p-5 backdrop-blur">
          <Field label="Region">
            <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Version">
            <select className="input" value={version} onChange={(e) => setVersion(e.target.value)}>
              {VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="預設組合（快速切換）">
            <select className="input" onChange={(e) => setItems(e.target.value)} value={items}>
              {PRESETS.map((p) => (
                <option key={p.label} value={p.items}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Item IDs (skin,hair,face,hat,top,bottom,shoes,weapon...)">
            <input className="input font-mono text-xs" value={items} onChange={(e) => setItems(e.target.value)} />
          </Field>
          <Field label="Stance">
            <select className="input" value={stance} onChange={(e) => setStance(e.target.value)}>
              {STANCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={`Frame: ${frame}`}>
            <input type="range" min={0} max={3} value={frame} onChange={(e) => setFrame(Number(e.target.value))} className="w-full" />
          </Field>
          <Field label={`放大倍率: ${size}x`}>
            <input type="range" min={1} max={8} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
          </Field>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px]">
            <div className="mb-1 font-semibold text-slate-600">當前 URL：</div>
            <a className="break-all text-blue-600 underline" href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-700">
            <div>已成功載入次數：{loadCount}</div>
            {errors.length > 0 && (
              <div className="mt-1 text-rose-600">
                錯誤 {errors.length} 次（最後一次：{errors[errors.length - 1]}）
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-indigo-100 p-6">
          <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">即時預覽</div>
          <div
            style={{
              imageRendering: "pixelated",
              width: 120 * (size / 4),
              minHeight: 200 * (size / 4),
            }}
            className="flex items-center justify-center rounded-2xl bg-white/60 p-4 shadow-inner"
          >
            <img
              key={url}
              src={url}
              alt="character preview"
              style={{
                imageRendering: "pixelated",
                transform: `scale(${size})`,
                transformOrigin: "center center",
              }}
              onLoad={() => setLoadCount((n) => n + 1)}
              onError={() => setErrors((arr) => [...arr, new Date().toLocaleTimeString()])}
            />
          </div>
          <p className="mt-3 max-w-[250px] text-center text-[11px] text-slate-500">
            載不出來的話試試切 Region / Version，或開瀏覽器 DevTools Network 看 maplestory.io 的請求被擋在哪一層
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
