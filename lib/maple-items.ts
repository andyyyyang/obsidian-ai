/**
 * Curated MapleStory item list — 給紙娃娃編輯器顯示的菜單
 *
 * 所有 id 都用 version "222" 的資料庫驗證可用（自 PSSB-Bot 與通用 wiki 摘錄）。
 * 不是窮舉，只是熱門款式 — 之後要加品項，補進對應分類即可。
 *
 * id 規律備忘：
 *   2000-2003  body / 4 種膚色
 *   12000-12003 head (對應 body)
 *   20000+     face / 表情
 *   30000+     hair / 髮型
 *   1003xxx    hat
 *   104xxxx    top
 *   105xxxx    overall (連身衣)
 *   106xxxx    bottom
 *   107xxxx    shoes
 *   110xxxx    cape
 *   108xxxx    gloves
 *   101xxxx    face accessory
 *   102xxxx    eye accessory
 *   103xxxx    earrings
 *   13xxxxx-1xxxxxxx weapon
 */

export type MapleItemOption = { id: number; name: string };

// 四種膚色 — body / head 必須一起換
export const SKINS: { name: string; bodyId: number; headId: number }[] = [
  { name: "亮膚", bodyId: 2000, headId: 12000 },
  { name: "蒼白", bodyId: 2001, headId: 12001 },
  { name: "小麥", bodyId: 2002, headId: 12002 },
  { name: "深膚", bodyId: 2003, headId: 12003 },
];

export const FACES: MapleItemOption[] = [
  { id: 20000, name: "預設 (笑)" },
  { id: 20001, name: "微笑" },
  { id: 20002, name: "驚訝" },
  { id: 20003, name: "認真" },
  { id: 20004, name: "閃亮" },
  { id: 20005, name: "酷臉" },
  { id: 20007, name: "笑彎眼" },
  { id: 20012, name: "悲傷" },
  { id: 20020, name: "陶醉" },
  { id: 20022, name: "睡眼" },
  { id: 20023, name: "燦笑" },
  { id: 20030, name: "瞇眼" },
  { id: 20040, name: "怒目" },
  { id: 20100, name: "Hi" },
];

export const HAIRS: MapleItemOption[] = [
  { id: 30000, name: "黑色短髮" },
  { id: 30020, name: "黑色蓬鬆" },
  { id: 30030, name: "黑色貝雷" },
  { id: 30150, name: "中長黑" },
  { id: 30270, name: "捲短" },
  { id: 31002, name: "白色長髮" },
  { id: 32000, name: "金色長髮" },
  { id: 33000, name: "紅色短髮" },
  { id: 34020, name: "綠雙馬尾" },
  { id: 35000, name: "藍色長髮" },
  { id: 36082, name: "粉色雙馬尾" },
  { id: 37020, name: "紫色蓬鬆" },
  { id: 38050, name: "棕色波浪" },
  { id: 40000, name: "白短" },
  { id: 47547, name: "霧氣優雅" },
];

export const HATS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1002140, name: "圓帽 紅" },
  { id: 1002357, name: "巫師帽" },
  { id: 1002452, name: "睡帽" },
  { id: 1003351, name: "聖誕帽" },
  { id: 1003797, name: "皇冠" },
  { id: 1005006, name: "兔耳" },
  { id: 1005668, name: "黑色貝雷帽" },
  { id: 1005923, name: "草帽" },
  { id: 1004032, name: "廚師帽" },        // 餐廳重點
  { id: 1004036, name: "棒球帽" },
  { id: 1003118, name: "海盜帽" },
  { id: 1003800, name: "毛球帽" },
  { id: 1003801, name: "黑色三角" },
];

export const TOPS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1040002, name: "白色襯衫" },
  { id: 1040036, name: "黑色T" },
  { id: 1041002, name: "綠色運動衣" },
  { id: 1042003, name: "皮甲" },
  { id: 1042129, name: "暗黑斗篷上衣" },
  { id: 1042200, name: "海盜外套" },
  { id: 1042254, name: "古老套裝 上衣" },
  { id: 1042257, name: "棒球外套" },
  { id: 1042258, name: "薩滿上衣" },
  { id: 1040000, name: "灰色襯衫" },
];

export const BOTTOMS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1060002, name: "藍色長褲" },
  { id: 1060026, name: "黑色長褲" },
  { id: 1061002, name: "綠色短褲" },
  { id: 1062007, name: "皮甲褲" },
  { id: 1062112, name: "白色裙" },
  { id: 1062165, name: "古老套裝 褲" },
  { id: 1062168, name: "藍色短裙" },
  { id: 1062169, name: "格子裙" },
  { id: 1062200, name: "海盜褲" },
];

export const OVERALLS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1050018, name: "簡單連身藍" },
  { id: 1050081, name: "白色洋裝" },
  { id: 1053650, name: "魔法師長袍" },
  { id: 1052006, name: "戰士全身鎧" },
];

export const SHOES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1072001, name: "棕色皮鞋" },
  { id: 1072005, name: "綠色靴" },
  { id: 1072025, name: "白色高跟" },
  { id: 1072039, name: "運動鞋" },
  { id: 1072200, name: "海盜靴" },
  { id: 1072740, name: "魔法師涼鞋" },
  { id: 1073158, name: "古老靴" },
];

export const CAPES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1102039, name: "紅色披風" },
  { id: 1102484, name: "綠色斗篷" },
  { id: 1102775, name: "古老披風" },
  { id: 1102940, name: "黑色長披" },
];

export const GLOVES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1082002, name: "皮手套" },
  { id: 1082695, name: "古老手套" },
  { id: 1082636, name: "白手套" },
];

export const WEAPONS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1302000, name: "木劍" },
  { id: 1312000, name: "短斧" },
  { id: 1322000, name: "棍棒" },
  { id: 1332000, name: "短刀" },
  { id: 1372003, name: "法杖 (初級)" },
  { id: 1402259, name: "Two-handed Sword" },
  { id: 1442268, name: "槍械" },
  { id: 1452002, name: "弓" },
  { id: 1492000, name: "雙槍" },
];

export const FACE_ACCESSORIES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1012438, name: "黑面具" },
  { id: 1012478, name: "圓框眼鏡" },
  { id: 1012636, name: "墨鏡" },
  { id: 1012672, name: "閃亮裝飾" },
  { id: 1012757, name: "面罩" },
];

export const EYE_ACCESSORIES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1022232, name: "圓眼鏡" },
  { id: 1022211, name: "方眼鏡" },
  { id: 1022231, name: "墨鏡" },
];

export const EARRINGS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1032136, name: "金色耳環" },
  { id: 1032223, name: "紅色耳環" },
  { id: 1032330, name: "鑽石耳環" },
];

/** 把所有分類包成一個物件，給編輯器迭代用 */
export const MAPLE_ITEM_CATALOG = {
  face: FACES,
  hair: HAIRS,
  hat: HATS,
  top: TOPS,
  bottom: BOTTOMS,
  overall: OVERALLS,
  shoes: SHOES,
  cape: CAPES,
  gloves: GLOVES,
  weapon: WEAPONS,
  faceAccessory: FACE_ACCESSORIES,
  eyeAccessory: EYE_ACCESSORIES,
  earrings: EARRINGS,
} as const;

export type MapleCategoryKey = keyof typeof MAPLE_ITEM_CATALOG;

export const CATEGORY_LABELS: Record<MapleCategoryKey, string> = {
  face: "表情",
  hair: "髮型",
  hat: "帽子",
  top: "上衣",
  bottom: "褲子 / 裙",
  overall: "連身",
  shoes: "鞋子",
  cape: "披風",
  gloves: "手套",
  weapon: "武器",
  faceAccessory: "臉部飾品",
  eyeAccessory: "眼鏡",
  earrings: "耳環",
};
