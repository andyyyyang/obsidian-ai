/**
 * MapleStory.io 角色圖 URL 組建工具
 *
 * 來源協定：https://github.com/MapleStory-Archive/PSSB-Bot
 *   GET /api/character/{itemsJson}/{stance}/{frame}?{options}
 *
 *   itemsJson = ",".join([encodeURIComponent(JSON.stringify({ itemId, version }))]
 */

export type MapleStance =
  | "stand1"
  | "stand2"
  | "walk1"
  | "walk2"
  | "alert"
  | "fly"
  | "jump"
  | "sit"
  | "ladder"
  | "rope";

export type MapleLook = {
  bodyId: number;
  headId: number;
  faceId: number;
  hairId: number;
  // 裝備（任一可省）
  hatId?: number | null;
  topId?: number | null;
  bottomId?: number | null;
  overallId?: number | null;
  shoesId?: number | null;
  capeId?: number | null;
  glovesId?: number | null;
  weaponId?: number | null;
  faceAccessoryId?: number | null;
  eyeAccessoryId?: number | null;
  earringsId?: number | null;
};

const OPTIONAL_FIELDS = [
  "hatId",
  "topId",
  "bottomId",
  "overallId",
  "shoesId",
  "capeId",
  "glovesId",
  "weaponId",
  "faceAccessoryId",
  "eyeAccessoryId",
  "earringsId",
] as const satisfies readonly (keyof MapleLook)[];

export const MAPLE_DEFAULT_VERSION = "222";
const MAPLE_API_BASE = "https://maplestory.io/api";

export function buildMapleAvatarUrl(
  look: MapleLook,
  opts: {
    version?: string;
    stance?: MapleStance;
    frame?: number;
    resize?: number;
    flipX?: boolean;
    showEars?: boolean;
  } = {},
): string {
  const version = opts.version ?? MAPLE_DEFAULT_VERSION;

  // 必選：body / head / face / hair
  const ids: number[] = [look.bodyId, look.headId, look.faceId, look.hairId];
  for (const field of OPTIONAL_FIELDS) {
    const id = look[field];
    if (id) ids.push(id);
  }

  const itemsJson = ids
    .map((id) => encodeURIComponent(JSON.stringify({ itemId: id, version })))
    .join(",");

  const stance = opts.stance ?? "stand1";
  const frame = opts.frame ?? 0;

  const q = new URLSearchParams({
    showears: String(opts.showEars ?? false),
    showLefEars: "false",
    resize: String(opts.resize ?? 1),
    flipX: String(opts.flipX ?? false),
    bgColor: "0,0,0,0",
  });

  return `${MAPLE_API_BASE}/character/${itemsJson}/${stance}/${frame}?${q}`;
}

export function buildMapleItemIconUrl(itemId: number, version: string = MAPLE_DEFAULT_VERSION, region: string = "GMS"): string {
  return `${MAPLE_API_BASE}/${region}/${version}/item/${itemId}/icon`;
}

export const DEFAULT_MAPLE_LOOK: MapleLook = {
  bodyId: 2000,
  headId: 12000,
  faceId: 20000,
  hairId: 30030,
  hatId: null,
  topId: null,
  bottomId: null,
  overallId: null,
  shoesId: null,
  capeId: null,
  glovesId: null,
  weaponId: null,
  faceAccessoryId: null,
  eyeAccessoryId: null,
  earringsId: null,
};

/** 由員工 id 計算一個 deterministic 預設外觀（讓沒設定的人也有個樣子） */
export function deterministicMapleLook(seed: string): MapleLook {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const r = (n: number) => {
    h = (h * 1103515245 + 12345) | 0;
    return Math.abs(h) % n;
  };

  // 用我們 curated 列表內可用的 item id 隨機挑
  // 引用避免循環：直接寫死幾組安全 id
  const bodyOptions = [2000, 2001];
  const skinOffset = r(4); // 0..3
  const bodyId = bodyOptions[r(bodyOptions.length)] + skinOffset;
  const headId = bodyId + 10000;
  const hairOptions = [30000, 30030, 31002, 32000, 33000, 34020, 36082];
  const faceOptions = [20000, 20001, 20002, 20003, 20004, 20012];

  return {
    bodyId,
    headId,
    faceId: faceOptions[r(faceOptions.length)],
    hairId: hairOptions[r(hairOptions.length)],
    hatId: null,
    topId: null,
    bottomId: null,
    overallId: [null, 1053650, null][r(3)],
    shoesId: null,
    capeId: null,
    glovesId: null,
    weaponId: null,
    faceAccessoryId: null,
    eyeAccessoryId: null,
    earringsId: null,
  };
}
