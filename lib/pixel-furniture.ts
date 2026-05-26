/**
 * 辦公室家具與場景元素 — 像素風
 */

type Sprite = string[][];

function parse(raw: string): Sprite {
  return raw.trim().split("\n").map((l) => l.split(""));
}

function draw(
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

// ============================================================
// 家具 sprites
// ============================================================

const DESK = parse(`
.bbbbbbbbbbbbbbbbbbbbbbbb.
.bWWWWWWWWWWWWWWWWWWWWWWb.
.bWLLLLLLLLLLLLLLLLLLLLWb.
.bWLWWWWWWWWWWWWWWWWWWLWb.
.bWLW................WLWb.
.bWLW...EEEEEEEEEE...WLWb.
.bWLW..EEEEEEEEEEEE..WLWb.
.bWLW..EEEEEEEEEEEE..WLWb.
.bWLWWWWWWWWWWWWWWWWWWLWb.
.bWLLLLLLLLLLLLLLLLLLLLWb.
.bWWWWWWWWWWWWWWWWWWWWWWb.
.bbbbbbbbbbbbbbbbbbbbbbbb.
..b....................b..
..b....................b..
..b....................b..
..bb..................bb..
`);

const CHAIR = parse(`
..bbbbbbbb..
.bWWWWWWWWb.
.bWWWWWWWWb.
.bWWWWWWWWb.
.bbbbbbbbbb.
.b........b.
.b........b.
.b........b.
..b......b..
..b......b..
..b......b..
.bb......bb.
`);

const PLANT = parse(`
....GGGG....
...GGGGGG...
..GGgGgGGG..
..gGggGgGg..
...GGGGGG...
....GGGG....
.....GG.....
.....GG.....
....bbbb....
....bbbb....
....bWWb....
....bbbb....
`);

const COFFEE = parse(`
.bbbbbbbbb.
.b#######b.
.b#WWWWW#b.
.b#W###W#b.
.b#W#E#W#b.
.b#WWWWW#b.
.b#######b.
.b##E##E#b.
.b#######b.
.bbbbbbbbb.
.b.......b.
.bbbbbbbbb.
`);

const DOOR = parse(`
WWWWWWWWWWWWWW
WbbbbbbbbbbbbW
Wb##########bW
Wb##########bW
Wb###..#####bW
Wb###o.#####bW
Wb###..#####bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
Wb##########bW
WbbbbbbbbbbbbW
`);

const WINDOW = parse(`
bbbbbbbbbbbbbbbbbbbbbbbb
bWWWWWWWWWWWWWWWWWWWWWWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWSSSScSScSSWSSScSSSSSWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWWWWWWWWWWWWWWWWWWWWWWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWSSSSSSSSSSWSSSSSSSSSWb
bWWWWWWWWWWWWWWWWWWWWWWb
bbbbbbbbbbbbbbbbbbbbbbbb
`);

const WHITEBOARD = parse(`
bbbbbbbbbbbbbbbbbbbbbbbb
bWWWWWWWWWWWWWWWWWWWWWWb
bWaaWWWWWWaWWWWWWWWWWWWb
bWWWWWaaWWWWWWaaWWWWWWWb
bWWWWWWWWWWWWWWWWWWWWWWb
bWWaaaaaaaWWaaWWWWWWWWWb
bWWaWWWWWaWWaWWWWWWWWWWb
bWWaaaaaWaWWaWWWWWWWWWWb
bWWWWWaWWaWWaWWWWWWWWWWb
bWaaaaaWWaWWaaaaWWWWWWWb
bWWWWWWWWWWWWWWWWWWWWWWb
bbbbbbbbbbbbbbbbbbbbbbbb
`);

const CLOCK = parse(`
.bbbbbb.
bWWWWWWb
bWaWWaWb
bW#WWaWb
bWWWWWWb
bWWWaaWb
bWaWWWWb
.bbbbbb.
`);

const PRINTER = parse(`
.bbbbbbbbbbbb.
.b##########b.
.b#WWWWWWWW#b.
.b#WaaaaaaW#b.
.b#WaaaaaaW#b.
.b#WWWWWWWW#b.
.b##########b.
.bbbbbbbbbbbb.
`);

// 文件夾櫃
const CABINET = parse(`
.bbbbbbbbbb.
.bWWWWWWWWb.
.b##W##W##b.
.bWWWWWWWWb.
.b##W##W##b.
.bWWWWWWWWb.
.b##W##W##b.
.bWWWWWWWWb.
.bbbbbbbbbb.
`);

// 沙發
const SOFA = parse(`
.bb.............bb.
.bSSSSSSSSSSSSSSSb.
.bSWWWWWWWWWWWWWSb.
bbSWaaaaaaaaaaaWSbb
bSSWaaaaaaaaaaaWSSb
bSSSSSSSSSSSSSSSSSb
bSSSSSSSSSSSSSSSSSb
.bb.............bb.
`);

// 飲水機
const WATER = parse(`
.bbbbbbbb.
.bWWWWWWb.
.bWaaaaWb.
.bWaaaaWb.
.bWaaaaWb.
.bWWWWWWb.
.bWWWWWWb.
.bWbbbbWb.
.bWWWWWWb.
.bbbbbbbb.
.bb....bb.
.b......b.
.bbbbbbbb.
`);

// 立燈
const LAMP = parse(`
....yyyyyy....
...yyyyyyyy...
..yyyyyyyyyy..
.yyyyyyyyyyy y.
yyyyyyyyyyyyy.
.bbbbbbbbbbb..
......b.......
......b.......
......b.......
......b.......
....bbbbbbb...
....b.....b...
....bbbbbbb...
`);

// 公佈欄
const BULLETIN = parse(`
bbbbbbbbbbbbbbbb
bccccccccccccccb
bcRRRccGGGcWWWcb
bcRRRccGGGcWWWcb
bccccccccccccccb
bcaaccccccccccdb
bcaaccBBBccccddb
bcccccBBBcccccdb
bccccccccccccccb
bbbbbbbbbbbbbbbb
`);

// ============================================================
// 調色盤
// ============================================================

const WOOD_PALETTE = {
  b: "#3d2510",   // outline / 邊
  W: "#8b5a2b",   // 木紋
  L: "#a87645",   // 木紋亮
  E: "#2a3a4a",   // 螢幕
};

const CHAIR_PALETTE = {
  b: "#2a1a0a",
  W: "#5a3a1f",
};

const PLANT_PALETTE = {
  G: "#3d8a4a",
  g: "#5fa85a",
  b: "#5a3a1f",
  W: "#8b5a2b",
};

const COFFEE_PALETTE = {
  b: "#1a1410",
  "#": "#3a3a3a",
  W: "#888",
  E: "#a83030",
};

const DOOR_PALETTE = {
  W: "#7a5230",
  b: "#3d2510",
  "#": "#5a3a1f",
  o: "#f4c542", // 把手
};

const WINDOW_PALETTE = {
  b: "#5a3a1f",
  W: "#a87645",
  S: "#a3d8ff",   // 天空
  c: "#fff",      // 雲
};

const WINDOW_PALETTE_EVENING = {
  b: "#5a3a1f",
  W: "#a87645",
  S: "#ff9b5e",
  c: "#fff",
};

const WINDOW_PALETTE_NIGHT = {
  b: "#5a3a1f",
  W: "#a87645",
  S: "#1a2a4a",
  c: "#f4e4a0",   // 月亮/星星
};

const WHITEBOARD_PALETTE = {
  b: "#3a3a3a",
  W: "#f5f5f5",
  a: "#5d8fde",
};

const CLOCK_PALETTE = {
  b: "#3a3a3a",
  W: "#f5f5f5",
  a: "#1a1410",
  "#": "#cc3030",
};

const PRINTER_PALETTE = {
  b: "#3a3a3a",
  "#": "#666",
  W: "#e0e0e0",
  a: "#5d8fde",
};

const CABINET_PALETTE = {
  b: "#3a2515",
  W: "#5a3a1f",
  "#": "#8b5a2b",
};

const SOFA_PALETTE = {
  b: "#3a2515",
  S: "#5d4e8a",
  W: "#7a6ba8",
  a: "#9b8ed8",
};

const WATER_PALETTE = {
  b: "#3a3a3a",
  W: "#e0e0e0",
  a: "#5d9cd6",
};

const LAMP_PALETTE = {
  y: "#fff5a0",
  b: "#3a3a3a",
};

const BULLETIN_PALETTE = {
  b: "#3a2515",
  c: "#8b5a2b",
  R: "#e85a5a",
  G: "#5fbf5f",
  W: "#fffbe6",
  a: "#a3c8ff",
  B: "#5d8fde",
  d: "#3a3a3a",
};

// ============================================================
// 匯出繪圖函式
// ============================================================

type Drawer = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opts?: { tone?: "day" | "evening" | "night" }) => void;

function makeDrawer(sprite: Sprite, palette: Record<string, string>): Drawer {
  return (ctx, x, y, scale) => draw(ctx, sprite, palette, x, y, scale);
}

export const drawDesk = makeDrawer(DESK, WOOD_PALETTE);
export const drawChair = makeDrawer(CHAIR, CHAIR_PALETTE);
export const drawPlant = makeDrawer(PLANT, PLANT_PALETTE);
export const drawCoffee = makeDrawer(COFFEE, COFFEE_PALETTE);
export const drawDoor = makeDrawer(DOOR, DOOR_PALETTE);
export const drawWhiteboard = makeDrawer(WHITEBOARD, WHITEBOARD_PALETTE);
export const drawClock = makeDrawer(CLOCK, CLOCK_PALETTE);
export const drawPrinter = makeDrawer(PRINTER, PRINTER_PALETTE);
export const drawCabinet = makeDrawer(CABINET, CABINET_PALETTE);
export const drawSofa = makeDrawer(SOFA, SOFA_PALETTE);
export const drawWater = makeDrawer(WATER, WATER_PALETTE);
export const drawLamp = makeDrawer(LAMP, LAMP_PALETTE);
export const drawBulletin = makeDrawer(BULLETIN, BULLETIN_PALETTE);

export const drawWindow: Drawer = (ctx, x, y, scale, opts) => {
  const pal =
    opts?.tone === "night"
      ? WINDOW_PALETTE_NIGHT
      : opts?.tone === "evening"
        ? WINDOW_PALETTE_EVENING
        : WINDOW_PALETTE;
  draw(ctx, WINDOW, pal, x, y, scale);
};

// ============================================================
// 地板 / 牆面 / 整體場景
// ============================================================

/** 木地板（重複拼貼） */
export function drawFloor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
) {
  const tile = 16 * scale;
  for (let yy = y; yy < y + h; yy += tile) {
    for (let xx = x; xx < x + w; xx += tile) {
      // 木紋底色
      ctx.fillStyle = "#c8a06a";
      ctx.fillRect(xx, yy, tile, tile);
      // 紋路
      ctx.fillStyle = "#a87f50";
      ctx.fillRect(xx, yy + 5 * scale, tile, scale);
      ctx.fillRect(xx, yy + 10 * scale, tile, scale);
      // 木板分隔
      ctx.fillStyle = "#7a5a3a";
      ctx.fillRect(xx, yy + tile - scale, tile, scale);
      ctx.fillRect(xx + tile - scale, yy, scale, tile);
    }
  }
}

/** 牆面（純色 + 踢腳板） */
export function drawWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
  tone: "day" | "evening" | "night" = "day",
) {
  const colors = {
    day: { base: "#e8d8c0", line: "#c4a880" },
    evening: { base: "#d6a880", line: "#a87a50" },
    night: { base: "#3a3a55", line: "#1a1a30" },
  };
  const c = colors[tone];
  ctx.fillStyle = c.base;
  ctx.fillRect(x, y, w, h);
  // 牆紙橫線
  ctx.fillStyle = c.line;
  for (let yy = y + 8 * scale; yy < y + h - 4 * scale; yy += 16 * scale) {
    ctx.fillRect(x, yy, w, scale);
  }
  // 踢腳板
  ctx.fillStyle = "#3a2515";
  ctx.fillRect(x, y + h - 4 * scale, w, 4 * scale);
}

// 家具尺寸（已放大前的像素）— 用於 layout
export const FURNITURE_SIZES = {
  desk: { w: 26, h: 16 },
  chair: { w: 12, h: 12 },
  plant: { w: 12, h: 12 },
  coffee: { w: 11, h: 12 },
  door: { w: 14, h: 18 },
  whiteboard: { w: 24, h: 12 },
  clock: { w: 8, h: 8 },
  printer: { w: 14, h: 8 },
  cabinet: { w: 12, h: 9 },
  sofa: { w: 19, h: 8 },
  water: { w: 10, h: 13 },
  lamp: { w: 14, h: 13 },
  bulletin: { w: 16, h: 10 },
  window: { w: 24, h: 14 },
};
