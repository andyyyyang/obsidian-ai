/**
 * 餐廳場景 sprites — 楓之谷風像素美術
 *
 * sprite 字元定義同 pixel-art.ts 的家具部分：
 *   '.'  透明 / 空白
 *   其他字元對應 palette 內顏色
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
// 家具 sprites — 用單字元表示色槽
// ============================================================

// 開放式吧台（員工站後方準備餐點）
const COUNTER = parse(`
.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
.bWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWb.
.bWLLLLLLLLLLLLLLLLLLLLLLLLLLLLWb.
.bWLLLLLLLLLLLLLLLLLLLLLLLLLLLLWb.
.bWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWb.
.bWMMMMMMMMMMMMMMMMMMMMMMMMMMMMWb.
.bWMmmmmmmmmmmmmmmmmmmmmmmmmmmMWb.
.bWMmmmmmmmmmmmmmmmmmmmmmmmmmmMWb.
.bWMMMMMMMMMMMMMMMMMMMMMMMMMMMMWb.
.bWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWb.
.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
`);

// 圓形餐桌（俯視）
const DINING_TABLE = parse(`
.....bbbbbbbb.....
....bWWWWWWWWb....
...bWWWWWWWWWWb...
..bWWLLLLLLLLWWb..
..bWLrrrLLrrrLWb..
..bWLrPrLLrPrLWb..
..bWLrrrLLrrrLWb..
..bWWLLLLLLLLWWb..
...bWWWWWWWWWWb...
....bWWWWWWWWb....
.....bbbbbbbb.....
......b....b......
......b....b......
......b....b......
......bb..bb......
`);

// 餐椅
const DINING_CHAIR = parse(`
.bbbbbbb.
.bRRRRRb.
.bRRRRRb.
.bRRRRRb.
.bbbbbbb.
..b...b..
..b...b..
..b...b..
..b...b..
..b...b..
.bb...bb.
`);

// 高腳吧檯椅
const BAR_STOOL = parse(`
..bbbbb..
.bWWWWWb.
.bRRRRRb.
.bbbbbbb.
...b.b...
...b.b...
...b.b...
...b.b...
...b.b...
..bbbbb..
`);

// 義式咖啡機
const ESPRESSO = parse(`
.bbbbbbbbbb.
.bSSSSSSSSb.
.bS#####SSb.
.bSWWWWW#Sb.
.bSWoooW#Sb.
.bSWoooW#Sb.
.bSWWWWW#Sb.
.bS#####SSb.
.bS|||||SSb.
.bS#####SSb.
.bbbbbbbbbb.
.bbWWWWWWbb.
`);

// 烤箱 / 雙門
const OVEN = parse(`
.bbbbbbbbbbbbbb.
.bSSSSSSSSSSSSb.
.bSWWWWWWWWWWSb.
.bSWooWWWWooWSb.
.bSWWWWWWWWWWSb.
.bSSSSSSSSSSSSb.
.bSWWWWWWWWWWSb.
.bSWFFFWWFFFWSb.
.bSWFOFWWFOFWSb.
.bSWFFFWWFFFWSb.
.bSWWWWWWWWWWSb.
.bSWooWWWWooWSb.
.bSSSSSSSSSSSSb.
.bb..........bb.
`);

// 收銀機
const REGISTER = parse(`
..bbbbbbbbbb..
..bSSSSSSSSb..
..bSWWWWWWSb..
..bSW####WSb..
..bSW####WSb..
..bSW####WSb..
..bSWWWWWWSb..
..bSSSSSSSSb..
.bbbbbbbbbbbb.
.bSSSSSSSSSSb.
.bS########Sb.
.bS########Sb.
.bSSSSSSSSSSb.
.bbbbbbbbbbbb.
`);

// 牆掛黑板菜單
const MENU_BOARD = parse(`
bbbbbbbbbbbbbbbbbbbbbbbbbbbb
bWWWWWWWWWWWWWWWWWWWWWWWWWWb
bWcccccccccccccccccccccccWb
bWcCCCCCCCCCCCCCCCCCCCCCcWb
bWcCWWWWWWWWWWWWWWWWWWWCcWb
bWcCWMMMMMMMMMMMMMMMMMWCcWb
bWcCWMMyyyMMyMyMMMyyyMWCcWb
bWcCWMMyMyMMyMyMMMyMMMWCcWb
bWcCWMMyyyMMyyyMMMyyyMWCcWb
bWcCWMMyMyMMyMyMMMyMMMWCcWb
bWcCWMMyMyMMyMyMMMyyyMWCcWb
bWcCWMMMMMMMMMMMMMMMMMWCcWb
bWcCCCCCCCCCCCCCCCCCCCCCcWb
bWcccccccccccccccccccccccWb
bWWWWWWWWWWWWWWWWWWWWWWWWWWb
bbbbbbbbbbbbbbbbbbbbbbbbbbbb
`);

// 酒櫃 / 飲料架
const WINE_RACK = parse(`
bbbbbbbbbbbbbb
bWWWWWWWWWWWWb
bWGGRRGGRRGGWb
bWGGRRGGRRGGWb
bWGGRRGGRRGGWb
bWWWWWWWWWWWWb
bWBBYYBBYYBBWb
bWBBYYBBYYBBWb
bWBBYYBBYYBBWb
bWWWWWWWWWWWWb
bWPPGGPPGGPPWb
bWPPGGPPGGPPWb
bWPPGGPPGGPPWb
bWWWWWWWWWWWWb
bbbbbbbbbbbbbb
`);

// 大門（玻璃門 + 木框）
const ENTRY_DOOR = parse(`
WWWWWWWWWWWWWWWW
WbbbbbbbbbbbbbbW
Wb##########y#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb#SSSS##SSSS#bW
Wb############bW
Wb############bW
WbbbbbbbbbbbbbbW
`);

// 窗戶（餐廳大窗 — 看出去街景）
const REST_WINDOW = parse(`
bbbbbbbbbbbbbbbbbbbbbbbbbb
bWWWWWWWWWWWWWWWWWWWWWWWWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWSScSSSSSSSSScSSSSScSSSWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWWWWWWWWWWWWWWWWWWWWWWWWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWSSSSSSSSSSSSSSSSSSSSSSWb
bWWWWWWWWWWWWWWWWWWWWWWWWb
bbbbbbbbbbbbbbbbbbbbbbbbbb
`);

// 吊燈
const PENDANT_LAMP = parse(`
....b....
....b....
....b....
....b....
...bbb...
..bYYYb..
.bYWWWYb.
.bYWWWYb.
.bYYYYYb.
..bYYYb..
...bbb...
`);

// 盆栽
const PLANT_LG = parse(`
....GGGGGGG....
..GGGGGGGGGGG..
..GGgGgGgGgGG..
.GGgGGggGGgGGg.
.GggGGggGGggGg.
..gGGGGgGGGGg..
...GGGGGGGGG...
....GGGGGGG....
......GG......
......GG......
.....bbbb.....
.....bWWb.....
.....bWWb.....
.....bbbb.....
`);

// 冰箱（餐廳直立大冰箱）
const FRIDGE = parse(`
.bbbbbbbbb.
.bWWWWWWWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWWWWWWWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWMMMMMWb.
.bWWWWWWWb.
.bbbbbbbbb.
`);

// 立式時鐘（牆掛）
const WALL_CLOCK = parse(`
..bbbbb..
.bWWWWWb.
.bWWaWWb.
.bWaWWWb.
.bWWWWaWb.
.bWWWaaWb.
.bWWWWWWb.
.bWWWWWWb.
..bbbbb..
`);

// ============================================================
// 調色盤
// ============================================================

const COUNTER_PALETTE = {
  b: "#3d2510",
  W: "#8b5a2b",
  L: "#a87645",
  M: "#2c3a52",   // 大理石頂面
  m: "#475979",   // 大理石紋
};

const TABLE_PALETTE = {
  b: "#3d2510",
  W: "#dcc7a4",   // 桌布
  L: "#a87645",   // 桌墊
  r: "#cc4040",   // 紅色花紋
  P: "#fff",      // 中央白點
};

const CHAIR_PALETTE = {
  b: "#3a1a08",
  R: "#a8442a",   // 紅椅墊
  W: "#5a3a1f",
};

const STOOL_PALETTE = {
  b: "#1a1410",
  W: "#3a3a3a",
  R: "#a8442a",
};

const ESPRESSO_PALETTE = {
  b: "#1a1410",
  S: "#9a9a9a",   // 不鏽鋼
  W: "#2a2a2a",
  "#": "#1a1a1a",
  o: "#ffa540",   // 出水口
  "|": "#444",
};

const OVEN_PALETTE = {
  b: "#1a1410",
  S: "#5a5a5a",
  W: "#2a2a2a",
  o: "#888",
  F: "#ff8a40",
  O: "#fff5a0",
};

const REGISTER_PALETTE = {
  b: "#1a1410",
  S: "#3a3a3a",
  W: "#f4f4f4",
  "#": "#1a1a1a",
};

const MENU_PALETTE = {
  b: "#3a2515",
  W: "#5a3a1f",
  c: "#3d2510",
  C: "#0d3d22",   // 黑板深綠
  M: "#0d3d22",
  y: "#fff5a0",   // 粉筆字
};

const WINE_PALETTE = {
  b: "#3a2515",
  W: "#5a3a1f",
  G: "#3d6d3a",  // 綠瓶
  R: "#8b1a2a",  // 紅酒
  B: "#1a2a5d",  // 藍瓶
  Y: "#c89846",  // 金瓶
  P: "#5a2d6d",  // 紫瓶
};

const DOOR_PALETTE = {
  W: "#7a5230",
  b: "#3d2510",
  "#": "#5a3a1f",
  S: "#a3d8ff",
  y: "#f4c542",
};

const REST_WINDOW_PALETTE_DAY = {
  b: "#5a3a1f",
  W: "#a87645",
  S: "#a3d8ff",
  c: "#fff",
};

const REST_WINDOW_PALETTE_EVENING = {
  b: "#5a3a1f",
  W: "#a87645",
  S: "#ff9b5e",
  c: "#fff",
};

const REST_WINDOW_PALETTE_NIGHT = {
  b: "#5a3a1f",
  W: "#a87645",
  S: "#1a2a4a",
  c: "#f4e4a0",
};

const LAMP_PALETTE = {
  b: "#1a1410",
  Y: "#f4c542",
  W: "#fff5a0",
};

const PLANT_PALETTE = {
  G: "#3d8a4a",
  g: "#5fa85a",
  b: "#5a3a1f",
  W: "#8b5a2b",
};

const FRIDGE_PALETTE = {
  b: "#3a3a3a",
  W: "#d0d0d0",
  M: "#a0a0a0",
};

const CLOCK_PALETTE = {
  b: "#1a1410",
  W: "#f5f5f5",
  a: "#1a1410",
};

// ============================================================
// 匯出 drawer
// ============================================================

type Drawer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  opts?: { tone?: "day" | "evening" | "night" },
) => void;

function makeDrawer(sprite: Sprite, palette: Record<string, string>): Drawer {
  return (ctx, x, y, scale) => draw(ctx, sprite, palette, x, y, scale);
}

export const drawCounter = makeDrawer(COUNTER, COUNTER_PALETTE);
export const drawDiningTable = makeDrawer(DINING_TABLE, TABLE_PALETTE);
export const drawDiningChair = makeDrawer(DINING_CHAIR, CHAIR_PALETTE);
export const drawBarStool = makeDrawer(BAR_STOOL, STOOL_PALETTE);
export const drawEspresso = makeDrawer(ESPRESSO, ESPRESSO_PALETTE);
export const drawOven = makeDrawer(OVEN, OVEN_PALETTE);
export const drawRegister = makeDrawer(REGISTER, REGISTER_PALETTE);
export const drawMenuBoard = makeDrawer(MENU_BOARD, MENU_PALETTE);
export const drawWineRack = makeDrawer(WINE_RACK, WINE_PALETTE);
export const drawEntryDoor = makeDrawer(ENTRY_DOOR, DOOR_PALETTE);
export const drawPendantLamp = makeDrawer(PENDANT_LAMP, LAMP_PALETTE);
export const drawRestPlant = makeDrawer(PLANT_LG, PLANT_PALETTE);
export const drawFridge = makeDrawer(FRIDGE, FRIDGE_PALETTE);
export const drawWallClock = makeDrawer(WALL_CLOCK, CLOCK_PALETTE);

export const drawRestWindow: Drawer = (ctx, x, y, scale, opts) => {
  const pal =
    opts?.tone === "night"
      ? REST_WINDOW_PALETTE_NIGHT
      : opts?.tone === "evening"
        ? REST_WINDOW_PALETTE_EVENING
        : REST_WINDOW_PALETTE_DAY;
  draw(ctx, REST_WINDOW, pal, x, y, scale);
};

// ============================================================
// 地板 / 牆面
// ============================================================

/** 餐廳磁磚地板（黑白格） */
export function drawTileFloor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
) {
  const tile = 12 * scale;
  let row = 0;
  for (let yy = y; yy < y + h; yy += tile) {
    let col = 0;
    for (let xx = x; xx < x + w; xx += tile) {
      const dark = (row + col) % 2 === 0;
      ctx.fillStyle = dark ? "#d8c3a6" : "#f0e3c8";
      ctx.fillRect(xx, yy, tile, tile);
      // 縫線
      ctx.fillStyle = "#a88660";
      ctx.fillRect(xx, yy + tile - scale, tile, scale);
      ctx.fillRect(xx + tile - scale, yy, scale, tile);
      col++;
    }
    row++;
  }
}

/** 餐廳牆面 — 上半磚紋 + 下半護牆板 */
export function drawRestWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
  tone: "day" | "evening" | "night" = "day",
) {
  const palette = {
    day:     { base: "#f3dfb8", brick: "#dbc093", wood: "#7a5230", trim: "#5a3a1f" },
    evening: { base: "#e9bf83", brick: "#c69960", wood: "#5a3818", trim: "#3a230f" },
    night:   { base: "#3a3a55", brick: "#252540", wood: "#1a1830", trim: "#0e0c1a" },
  };
  const c = palette[tone];

  // 上半牆面（磚紋）
  ctx.fillStyle = c.base;
  ctx.fillRect(x, y, w, h);

  // 磚塊紋路（錯落排列）
  ctx.fillStyle = c.brick;
  const brickH = 6 * scale;
  for (let yy = y; yy < y + h; yy += brickH) {
    const offset = ((Math.floor((yy - y) / brickH)) % 2) * 8 * scale;
    for (let xx = x - offset; xx < x + w; xx += 16 * scale) {
      ctx.fillRect(xx + 14 * scale, yy, 2 * scale, brickH);
    }
    ctx.fillRect(x, yy + brickH - scale, w, scale);
  }

  // 護牆板（底部）
  const wainscot = 12 * scale;
  ctx.fillStyle = c.wood;
  ctx.fillRect(x, y + h - wainscot, w, wainscot);
  ctx.fillStyle = c.trim;
  ctx.fillRect(x, y + h - wainscot, w, scale);
  ctx.fillRect(x, y + h - scale, w, scale);
}
