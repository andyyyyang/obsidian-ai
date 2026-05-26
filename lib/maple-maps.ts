/**
 * MapleStory 地圖背景 — 從 maplestory.io 抓組合好的地圖 PNG
 *
 * URL 格式：/api/{region}/{version}/map/{mapId}/render
 * 回傳：地圖完整背景圖（含場景、家具、招牌等）
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

/**
 * 餐廳 / 食肆主題的 MapleStory 地圖 ID。
 *
 * 來源：社群常用、Hidden Street / MapleWiki 上標記為「Restaurant」「Tavern」「Cafe」
 * 「Inn」等室內場景。每個我都標註簡介，方便玩家挑。
 *
 * 注意：不同版本 maplestory.io server 上的有效 mapId 略有差異，
 * 若哪張載不出來，UI 會自動切換下一張。
 */
export type MapleMapPreset = {
  id: number;
  name: string;
  hint: string;
};

export const RESTAURANT_MAPS: MapleMapPreset[] = [
  { id: 100000201, name: "Pig's Bar (Henesys 旅店)",      hint: "經典 Henesys 木屋酒吧" },
  { id: 102000003, name: "Ellinia 旅店 (魔法師村)",       hint: "蘑菇樹屋內的圓木餐廳" },
  { id: 104000110, name: "Perion 旅店 (戰士村)",          hint: "石窟風土民情" },
  { id: 200000001, name: "Orbis 旅店",                    hint: "雲端神殿小館" },
  { id: 211000000, name: "El Nath 雪地小屋",              hint: "雪山木造客棧" },
  { id: 220000200, name: "Ludibrium 玩具城旅店",          hint: "彩色玩具家具" },
  { id: 230000110, name: "水世界 Aquarium",               hint: "藍綠色海底咖啡" },
  { id: 240000110, name: "Leafre 旅店",                   hint: "Minar 森林木造旅店" },
  { id: 250000110, name: "Mu Lung 茶館",                  hint: "東方武當山風格茶屋" },
  { id: 251000100, name: "Herb Town 客棧 (中藥村)",       hint: "中藥草地中式餐廳" },
  { id: 260000100, name: "Ariant 阿拉伯餐廳",             hint: "沙漠中東風格 (墊子+地毯)" },
  { id: 540010100, name: "新葉城 Singapore",              hint: "亞洲料理一條街" },
  { id: 600010003, name: "Folk Town 餐廳 (韓國民俗村)",   hint: "韓式傳統屋簷" },
  { id: 800000100, name: "Showa Town (日本街)",           hint: "日式街道夜景" },
  { id: 801000000, name: "Mushroom Shrine 神社",          hint: "鳥居 + 燈籠" },
  { id: 802000000, name: "Showa 武士酒場",                hint: "燈籠 + 榻榻米" },
];

export const DEFAULT_RESTAURANT_MAP_ID = RESTAURANT_MAPS[0].id;

/** 登入畫面用的「適合做背景」地圖 — 大背景、視野開闊 */
export const LOGIN_MAPS: MapleMapPreset[] = [
  { id: 100000000, name: "Henesys 中央",      hint: "粉色女皇樹 + 蘑菇" },
  { id: 102000000, name: "Ellinia 法師村",   hint: "巨大蘑菇樹屋" },
  { id: 200000000, name: "Orbis 雲端神殿",   hint: "雲與夕陽" },
  { id: 211000000, name: "El Nath 雪山",     hint: "雪地" },
  { id: 240000000, name: "Leafre 樹城",      hint: "巨大世界樹" },
  { id: 250000000, name: "Mu Lung 武當山",   hint: "山霧 + 寺廟" },
];

export const DEFAULT_LOGIN_MAP_ID = LOGIN_MAPS[0].id;
