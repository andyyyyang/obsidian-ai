/**
 * MapleStory 地圖背景 — 從 maplestory.io 抓組合好的地圖 PNG
 *
 * URL 格式：/api/{region}/{version}/map/{mapId}/render
 */

import { MAPLE_DEFAULT_VERSION } from "./maple-avatar";

const MAPLE_API_BASE = "https://maplestory.io/api";

export function buildMapleMapUrl(
  mapId: number,
  opts: { region?: string; version?: string } = {},
): string {
  const region = opts.region ?? "GMS";
  const version = opts.version ?? MAPLE_DEFAULT_VERSION;
  return `${MAPLE_API_BASE}/${region}/${version}/map/${mapId}/render`;
}

export type MapleMapPreset = {
  id: number;
  name: string;
  hint: string;
  floorYPct: number;      // 地板在 16:8 cropped 畫面內的 Y% (從上算)
};

/**
 * 大廳 / 餐廳場景地圖。
 * floorYPct 表示「地板平台」在我們 object-cover (center bottom) 之後的視覺位置。
 *
 * 預設使用 Ereve 黎明之路 — 月光海景 + 巨樹 + 雲端單一平台。
 */
export const RESTAURANT_MAPS: MapleMapPreset[] = [
  { id: 130030000, name: "Ereve 黎明之路",       hint: "月光海景 + 巨樹 + 雲端平台", floorYPct: 78 },
  { id: 130000000, name: "Ereve 女神之地 (主場)", hint: "Cygnus 神官之所",          floorYPct: 80 },
  { id: 130020000, name: "Ereve 訓練之路",       hint: "草原 + 雲台",                floorYPct: 82 },
  { id: 130000100, name: "Ereve 女神宮殿前",     hint: "宮殿走道",                   floorYPct: 80 },
  { id: 100000201, name: "Pig's Bar (Henesys 旅店)", hint: "經典蘑菇木屋酒吧",     floorYPct: 92 },
  { id: 102000003, name: "Ellinia 旅店",          hint: "蘑菇樹屋木餐廳",            floorYPct: 92 },
  { id: 260000100, name: "Ariant 阿拉伯餐廳",     hint: "沙漠墊子 + 地毯",           floorYPct: 88 },
];

export const DEFAULT_RESTAURANT_MAP_ID = RESTAURANT_MAPS[0].id;
export const DEFAULT_RESTAURANT_MAP = RESTAURANT_MAPS[0];

/** 由 map id 回查 preset，找不到就回預設值 */
export function getMapPreset(mapId: number): MapleMapPreset {
  return RESTAURANT_MAPS.find((m) => m.id === mapId) ?? RESTAURANT_MAPS[0];
}

/** 登入畫面用的「適合做背景」地圖 — 不再使用，但保留 export 給以後備用 */
export const LOGIN_MAPS: MapleMapPreset[] = [
  { id: 100000000, name: "Henesys 中央", hint: "粉色蘑菇樹", floorYPct: 86 },
  { id: 910000000, name: "自由市場",     hint: "市集攤位", floorYPct: 88 },
];

export const DEFAULT_LOGIN_MAP_ID = LOGIN_MAPS[0].id;
