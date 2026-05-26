/**
 * 像素美術系統 — 楓之谷風 chibi 角色 + 辦公室家具
 *
 * 設計概念：所有 sprite 都用「字元陣列」表示，每個字元對應一個色槽
 * 繪圖時依角色設定查調色盤、放大繪製到 canvas
 *
 * 字元定義：
 *   '.'  透明
 *   '#'  outline (深色，依場景變色)
 *   'S'  皮膚 (3 階：1=亮 2=中 3=暗 → 'a','S','b')
 *   'H'  頭髮 (2 階：'h'=亮 'H'=主)
 *   'T'  上衣 (2 階：'t'=亮 'T'=主)
 *   'P'  褲子 (2 階：'p'=亮 'P'=主)
 *   'B'  鞋子
 *   'E'  眼睛 / 五官 (純黑)
 *   'W'  白色 (襯衫高光、眼白)
 *   'M'  嘴巴 / 表情 (粉紅)
 */

// ============================================================
// 調色盤 — 給玩家選擇的顏色組
// ============================================================

export const SKIN_TONES = [
  { light: "#ffe0c4", base: "#f5c89c", shadow: "#d49968" }, // 0 淺
  { light: "#f3cea0", base: "#dba672", shadow: "#a07140" }, // 1 中淺
  { light: "#cf9a6e", base: "#a4734a", shadow: "#73482a" }, // 2 中深
  { light: "#8b5e3c", base: "#5e3d22", shadow: "#3a2515" }, // 3 深
];

export const HAIR_COLORS = [
  { light: "#5a3a1f", main: "#3d2510" }, // 0 黑
  { light: "#a87645", main: "#7a4d22" }, // 1 棕
  { light: "#f0c674", main: "#c89846" }, // 2 金
  { light: "#e85a5a", main: "#b53030" }, // 3 紅
  { light: "#ffb5d9", main: "#e07ba9" }, // 4 粉
  { light: "#a3d8ff", main: "#5e9cd6" }, // 5 藍
  { light: "#b8e0a3", main: "#6fa856" }, // 6 綠
  { light: "#d8c3ff", main: "#9e7fd6" }, // 7 紫
];

export const SHIRT_COLORS = [
  { light: "#ffffff", main: "#e6ecf2", shadow: "#b8c4d0" }, // 0 白襯衫
  { light: "#a3c8ff", main: "#5d8fde", shadow: "#3960a8" }, // 1 藍
  { light: "#ffb3b3", main: "#e85a5a", shadow: "#a83030" }, // 2 紅
  { light: "#ffe599", main: "#f4c542", shadow: "#b8902a" }, // 3 黃
  { light: "#b8e8b8", main: "#5fbf5f", shadow: "#2e8b3a" }, // 4 綠
  { light: "#d8b8ff", main: "#9b6dd8", shadow: "#6a3fa3" }, // 5 紫
  { light: "#ffd2a3", main: "#f29944", shadow: "#a8642a" }, // 6 橘
  { light: "#888", main: "#444", shadow: "#222" },         // 7 黑
];

export const PANTS_COLORS = [
  { main: "#2c3e50", shadow: "#1a2733" }, // 0 西裝藍
  { main: "#5d4e37", shadow: "#3d3422" }, // 1 卡其
  { main: "#2a4d2a", shadow: "#1a331a" }, // 2 軍綠
  { main: "#444", shadow: "#222" },        // 3 黑
  { main: "#8b6b3d", shadow: "#5d4628" }, // 4 棕
  { main: "#a8857d", shadow: "#735853" }, // 5 粉灰
  { main: "#4a6fa8", shadow: "#2e4870" }, // 6 牛仔
  { main: "#fff", shadow: "#ccc" },        // 7 白
];

export const SHOE_COLORS = [
  "#3a2515", // 0 棕
  "#222",     // 1 黑
  "#fff",     // 2 白
  "#a83030",  // 3 紅
];

export const EYE_STYLES = ["normal", "happy", "wink"] as const;

// ============================================================
// Sprite 定義
// ============================================================

// 角色站立 — 16 寬 x 28 高
// 頭部固定 10 cols 寬 (3-12)，身體 12 cols 寬 (2-13)
const CHAR_STAND = `
....##HHHH##....
...#HhhhhhhhH#..
...#HhhhhhhhH#..
...#HhhhhhhhH#..
...#HhSSSSSShH#.
...#HSSSSSSSSH#.
...#SSSSSSSSSS#.
...#SEESSEESS#..
...#SSSSSSSSSS#.
...#SSSMMSSSS#..
....##SSSSSS##..
.....#SSSSSS#...
....#TTTTTTTT#..
...#tTTTTWTTTT#.
..#tTTTTWTTTTtT#
..#TTTTTWTTTTTT#
..#TTTTTWTTTTTT#
..#TTTTTWTTTTTT#
...#TTTTTTTTTT#.
....#PPPPPPPP#..
....#PPPPPPPP#..
....#PPPPPPPP#..
....#PPP##PPP#..
....#PPP##PPP#..
....#PPP##PPP#..
...#BBBB##BBBB#.
...##BBB##BBB##.
.....##....##...
`;

// 走路 frame — 雙腳張開
const CHAR_WALK = `
....##HHHH##....
...#HhhhhhhhH#..
...#HhhhhhhhH#..
...#HhhhhhhhH#..
...#HhSSSSSShH#.
...#HSSSSSSSSH#.
...#SSSSSSSSSS#.
...#SEESSEESS#..
...#SSSSSSSSSS#.
...#SSSMMSSSS#..
....##SSSSSS##..
.....#SSSSSS#...
....#TTTTTTTT#..
...#tTTTTWTTTT#.
..#tTTTTWTTTTtT#
..#TTTTTWTTTTTT#
..#TTTTTWTTTTTT#
..#TTTTTWTTTTTT#
...#TTTTTTTTTT#.
....#PPPPPPPP#..
....#PPPPPPPP#..
...#PPPP##PPPP#.
...#PPP#..#PPP#.
...#PP#....#PP#.
..#BBB#....#BBB#
..##BB#....#BB##
................
................
`;

// ============ 髮型疊加層 ============
// 髮型只繪製頭部區域 (前 12 列)，覆蓋在身體之上
// 使用 'H'=主色, 'h'=亮色, '#'=深色描邊

const HAIR_STYLES = [
  // 0 — 短髮 (默認，已內建在 base sprite)
  null,

  // 1 — 長髮（蓋耳朵）
  `
.....##HH##.....
....#HhhhhhH#...
...#HhhhHhhHH#..
...#HhhhhhhHH#..
..#HHhhhhhhhHH#.
..#HH......HHH#.
..#H.........HH.
..#H..........H.
.................
.................
.................
.................
`,

  // 2 — 雙馬尾
  `
....##H##H##....
...#HhHhhHhH#...
..#HhhhHhhHhH#..
..#HhhhhhhhHH#..
..#HHhhhhhhHH#..
..#HH......HH#..
..H.........H...
.................
.................
.................
.................
.................
`,

  // 3 — 龐克頭（豎起）
  `
......HHHH......
.....HHHHHH.....
....HHHHHHHH....
...##HhHhhhHH#..
...#HhhhHhHHH#..
...#HhhhhhHHH#..
...#HSSSSSHH#...
.................
.................
.................
.................
.................
`,

  // 4 — 中分長髮
  `
....##HH##HH##..
...#HhhH##HhhH#.
..#HhhhH##HhhHH#
..#HHhhhHHhhhHH#
..#H#hhhHhhhh#H#
..#H#SSSSSSSS#H#
..#H#SSSSSSSS#H#
..#H..........H#
..#HH........HH#
..#HH........HH#
.................
.................
`,
];

// ============ 配件 ============

const HATS: Record<string, string> = {
  cap: `
.................
.....######.....
....#WWWWW#.....
...#WWWWWWW#....
..#WWWWWWWWW#...
..############..
....######......
.................
`,
  wizard: `
........##......
.......#WW#.....
......#WWWW#....
......#WWWW#....
.....#WWWWWW#...
.....#WWWWWW#...
....#WWWWWWWW#..
....############
.................
.................
`,
  santa: `
.................
......##........
.....#WW#.......
....#WWWW#......
...#WWWWWW#.....
..#WWWWWWWW#....
..#RRRRRRRR#....
..############..
.....######.....
`,
  crown: `
.................
.#..#..#..#..#..
.##.##.##.##.##.
.WWWWWWWWWWWWWW.
.##############.
.................
.................
.................
`,
  chef: `
....##WWWW##....
...#WWWWWWWW#...
..#WWWWWWWWWW#..
..#WWWWWWWWWW#..
..#WWWWWWWWWW#..
...##WWWWWW##...
....########....
.................
`,
  waiter: `
.................
....########....
...#WWWWWWWW#...
...#W#####W#....
..#WW#####WW#...
..############..
.....######.....
.................
`,
};

const GLASSES: Record<string, string> = {
  round: `
.................
.................
.................
.................
.................
.................
.................
..##E##.##E##....
..#####.#####....
..##E##.##E##....
.................
`,
  square: `
.................
.................
.................
.................
.................
.................
.................
..#####.#####....
..#E#E#.#E#E#....
..#####.#####....
.................
`,
  sunglasses: `
.................
.................
.................
.................
.................
.................
.................
..#####.#####....
..#EEE#.#EEE#....
..#####.#####....
.................
`,
};

// ============================================================
// 解析 + 繪製
// ============================================================

type Sprite = string[][];

function parse(raw: string): Sprite {
  return raw.trim().split("\n").map((line) => line.split(""));
}

const SPR_STAND = parse(CHAR_STAND);
const SPR_WALK = parse(CHAR_WALK);
const SPR_HAIRS = HAIR_STYLES.map((s) => (s ? parse(s) : null));
const SPR_HATS: Record<string, Sprite> = Object.fromEntries(
  Object.entries(HATS).map(([k, v]) => [k, parse(v)]),
);
const SPR_GLASSES: Record<string, Sprite> = Object.fromEntries(
  Object.entries(GLASSES).map(([k, v]) => [k, parse(v)]),
);

export type AvatarLook = {
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  shirtColor: number;
  pantsColor: number;
  shoeColor: number;
  eyeStyle: number;
  hat: string | null;
  glasses: string | null;
  apron: boolean;
};

export const DEFAULT_LOOK: AvatarLook = {
  skinTone: 0,
  hairStyle: 0,
  hairColor: 0,
  shirtColor: 1,
  pantsColor: 0,
  shoeColor: 0,
  eyeStyle: 0,
  hat: null,
  glasses: null,
  apron: false,
};

function buildPalette(look: AvatarLook): Record<string, string> {
  const skin = SKIN_TONES[look.skinTone] ?? SKIN_TONES[0];
  const hair = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const shirt = SHIRT_COLORS[look.shirtColor] ?? SHIRT_COLORS[0];
  const pants = PANTS_COLORS[look.pantsColor] ?? PANTS_COLORS[0];
  const shoe = SHOE_COLORS[look.shoeColor] ?? SHOE_COLORS[0];
  return {
    "#": "#1a1410",
    S: skin.base,
    a: skin.light,
    b: skin.shadow,
    H: hair.main,
    h: hair.light,
    T: shirt.main,
    t: shirt.light,
    P: pants.main,
    p: pants.main,
    B: shoe,
    E: "#1a1410",
    W: "#ffffff",
    M: "#e07ba9",
    R: "#cc3333",
  };
}

/**
 * 繪製一個角色到 canvas
 * @param ctx canvas context
 * @param look 外觀設定
 * @param x 螢幕座標 (左上角)
 * @param y
 * @param scale 放大倍率（建議 3 或 4）
 * @param frame 動畫格 (0=stand, 1=walk)
 * @param flip 是否水平翻轉（朝左）
 */
export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  look: AvatarLook,
  x: number,
  y: number,
  scale: number,
  frame: number = 0,
  flip: boolean = false,
) {
  const palette = buildPalette(look);
  const baseSprite = frame === 1 ? SPR_WALK : SPR_STAND;

  ctx.save();
  if (flip) {
    ctx.translate(x + baseSprite[0].length * scale, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  } else {
    ctx.translate(x, y);
    x = 0;
    y = 0;
  }

  // 1. 角色身體
  drawSpriteRaw(ctx, baseSprite, palette, x, y, scale);

  // 2. 髮型疊加
  const hairSprite = SPR_HAIRS[look.hairStyle];
  if (hairSprite) {
    drawSpriteRaw(ctx, hairSprite, palette, x, y, scale);
  }

  // 3. 眼鏡
  if (look.glasses && SPR_GLASSES[look.glasses]) {
    drawSpriteRaw(ctx, SPR_GLASSES[look.glasses], palette, x, y, scale);
  }

  // 4. 帽子
  if (look.hat && SPR_HATS[look.hat]) {
    drawSpriteRaw(ctx, SPR_HATS[look.hat], palette, x, y - 2 * scale, scale);
  }

  // 5. 圍裙（餐廳工作服）
  if (look.apron) {
    drawApron(ctx, x, y, scale);
  }

  ctx.restore();
}

function drawApron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  // 白色圍裙：覆蓋胸前 + 腰部 + 裙擺
  const apronColor = "#f8f4ec";
  const apronShadow = "#dcd2bd";
  const strap = "#8b5a2b";
  // 頸後吊帶
  ctx.fillStyle = strap;
  ctx.fillRect(x + 6 * scale, y + 11 * scale, scale, 2 * scale);
  ctx.fillRect(x + 9 * scale, y + 11 * scale, scale, 2 * scale);
  // 胸前布料 (上衣中央)
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(x + 5 * scale, y + 12 * scale, 6 * scale, scale);
  ctx.fillStyle = apronColor;
  ctx.fillRect(x + 5 * scale, y + 13 * scale, 6 * scale, 6 * scale);
  ctx.fillStyle = apronShadow;
  ctx.fillRect(x + 5 * scale, y + 18 * scale, 6 * scale, scale);
  // 腰繩
  ctx.fillStyle = strap;
  ctx.fillRect(x + 3 * scale, y + 19 * scale, 10 * scale, scale);
  // 裙擺
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(x + 3 * scale, y + 20 * scale, scale, 5 * scale);
  ctx.fillRect(x + 12 * scale, y + 20 * scale, scale, 5 * scale);
  ctx.fillStyle = apronColor;
  ctx.fillRect(x + 4 * scale, y + 20 * scale, 8 * scale, 5 * scale);
  ctx.fillStyle = apronShadow;
  ctx.fillRect(x + 4 * scale, y + 24 * scale, 8 * scale, scale);
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(x + 4 * scale, y + 25 * scale, 8 * scale, scale);
  // 口袋
  ctx.fillStyle = apronShadow;
  ctx.fillRect(x + 6 * scale, y + 21 * scale, 4 * scale, 2 * scale);
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(x + 6 * scale, y + 23 * scale, 4 * scale, scale);
}

function drawSpriteRaw(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  palette: Record<string, string>,
  x: number,
  y: number,
  scale: number,
) {
  for (let yy = 0; yy < sprite.length; yy++) {
    const row = sprite[yy];
    for (let xx = 0; xx < row.length; xx++) {
      const c = row[xx];
      if (c === "." || c === " ") continue;
      const color = palette[c];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + xx * scale, y + yy * scale, scale, scale);
    }
  }
}

/** 繪製陰影 (橢圓黑影) */
export function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y, w / 2.2, w / 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** 繪製姓名牌 (角色頭上) */
export function drawNameTag(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, scale: number) {
  ctx.font = `${10 * (scale / 3)}px "Press Start 2P", "PingFang TC", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = x;
  const cy = y;
  const w = ctx.measureText(name).width + 8;
  const h = 14 * (scale / 3);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.fillStyle = "#fff";
  ctx.fillText(name, cx, cy + 1);
}

/** 繪製對話泡泡 */
export function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale: number,
) {
  if (!text) return;
  ctx.font = `${9 * (scale / 3)}px "PingFang TC", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const padding = 6;
  const w = Math.min(160, ctx.measureText(text).width + padding * 2);
  const h = 18 * (scale / 3);
  const cx = x;
  const cy = y - h / 2;
  // 邊框
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(cx - w / 2 - 2, cy - h / 2 - 2, w + 4, h + 4);
  ctx.fillStyle = "#fffbe6";
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  // 小箭頭
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(cx - 3, cy + h / 2, 6, 2);
  ctx.fillRect(cx - 2, cy + h / 2 + 2, 4, 2);
  ctx.fillRect(cx - 1, cy + h / 2 + 4, 2, 2);
  ctx.fillStyle = "#fffbe6";
  ctx.fillRect(cx - 2, cy + h / 2, 4, 2);
  // 文字
  ctx.fillStyle = "#1a1410";
  ctx.fillText(text, cx, cy);
}

// 角色 sprite 寬高 (像素，未放大)
export const CHAR_W = 16;
export const CHAR_H = 28;
