/**
 * Curated MapleStory item list — 給紙娃娃編輯器顯示的菜單
 *
 * 所有 ID 都依 maplestory.io v222 規範。範圍：
 *   2000-2003   body (4 種膚色)
 *   12000-12003 head (對應 body)
 *   20000-29999 face / 表情
 *   30000-49999 hair
 *   100xxxx     hat
 *   101xxxx     face accessory
 *   102xxxx     eye accessory
 *   103xxxx     earrings
 *   104xxxx     top
 *   105xxxx     overall (連身衣)
 *   106xxxx     bottom
 *   107xxxx     shoes
 *   108xxxx     gloves
 *   110xxxx     cape
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
  { id: 20000, name: "預設笑" },
  { id: 20001, name: "微笑" },
  { id: 20002, name: "驚訝" },
  { id: 20003, name: "認真" },
  { id: 20004, name: "閃亮眼" },
  { id: 20005, name: "酷臉" },
  { id: 20006, name: "口張開" },
  { id: 20007, name: "笑彎眼" },
  { id: 20008, name: "甜笑" },
  { id: 20009, name: "得意" },
  { id: 20010, name: "壞笑" },
  { id: 20011, name: "嘟嘴" },
  { id: 20012, name: "悲傷" },
  { id: 20013, name: "皺眉" },
  { id: 20015, name: "汗顏" },
  { id: 20017, name: "天真" },
  { id: 20020, name: "陶醉" },
  { id: 20021, name: "迷茫" },
  { id: 20022, name: "睡眼" },
  { id: 20023, name: "燦笑" },
  { id: 20024, name: "瞇眼" },
  { id: 20026, name: "暈眩" },
  { id: 20030, name: "貓眼" },
  { id: 20040, name: "怒目" },
  { id: 20050, name: "炯炯" },
  { id: 20100, name: "Hi" },
  { id: 21000, name: "閃亮女" },
  { id: 21001, name: "嬌羞" },
  { id: 21002, name: "嘻嘻" },
  { id: 21003, name: "委屈" },
  { id: 21004, name: "雀躍" },
];

export const HAIRS: MapleItemOption[] = [
  // 男黑短
  { id: 30000, name: "黑色短" },
  { id: 30010, name: "黑色刺蝟" },
  { id: 30020, name: "黑色蓬鬆" },
  { id: 30030, name: "黑色貝雷" },
  { id: 30040, name: "黑色中分" },
  { id: 30050, name: "黑色俏皮" },
  { id: 30060, name: "黑色清爽" },
  { id: 30150, name: "中長黑" },
  { id: 30270, name: "捲短" },
  // 白系
  { id: 31000, name: "白短" },
  { id: 31002, name: "白色長" },
  { id: 31030, name: "白色蓬鬆" },
  { id: 31150, name: "白色中分" },
  // 金系
  { id: 32000, name: "金色長" },
  { id: 32030, name: "金色俏皮" },
  { id: 32050, name: "金色慵懶" },
  // 紅系
  { id: 33000, name: "紅短" },
  { id: 33020, name: "紅色火焰" },
  { id: 33050, name: "紅色狂野" },
  // 綠系
  { id: 34000, name: "綠短" },
  { id: 34020, name: "綠雙馬尾" },
  // 藍系
  { id: 35000, name: "藍色長" },
  { id: 35020, name: "藍色俏皮" },
  // 粉系
  { id: 36000, name: "粉短" },
  { id: 36082, name: "粉色雙馬尾" },
  { id: 36100, name: "粉色公主" },
  // 紫系
  { id: 37020, name: "紫色蓬鬆" },
  { id: 37050, name: "紫色長" },
  // 棕系
  { id: 38000, name: "棕短" },
  { id: 38050, name: "棕色波浪" },
  { id: 38100, name: "棕色丸子" },
  // 特殊
  { id: 40000, name: "雙馬尾橙" },
  { id: 41000, name: "甜美捲" },
  { id: 47547, name: "霧氣優雅 (女)" },
  { id: 45000, name: "公主長" },
  { id: 46000, name: "貓耳髮" },
];

export const HATS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  // 餐廳專業
  { id: 1004032, name: "廚師帽" },
  { id: 1004036, name: "棒球帽" },
  { id: 1005006, name: "兔耳髮帶" },
  // 巫師、節日
  { id: 1002357, name: "巫師帽" },
  { id: 1003351, name: "聖誕帽" },
  { id: 1003797, name: "皇冠" },
  // 一般帽
  { id: 1002140, name: "圓帽 紅" },
  { id: 1002452, name: "睡帽" },
  { id: 1005668, name: "黑色貝雷" },
  { id: 1005923, name: "草帽" },
  { id: 1003118, name: "海盜帽" },
  { id: 1003800, name: "毛球帽" },
  { id: 1003801, name: "黑色三角" },
  // 動物耳
  { id: 1005168, name: "貓耳" },
  { id: 1005169, name: "熊耳" },
  { id: 1005170, name: "狐狸耳" },
  { id: 1005171, name: "兔耳 粉" },
  { id: 1005172, name: "狼耳" },
  // 額外時尚
  { id: 1004003, name: "紳士帽" },
  { id: 1004004, name: "牛仔帽" },
  { id: 1004005, name: "貝蕾帽" },
  { id: 1004006, name: "騎士頭盔" },
  { id: 1004007, name: "毛線帽" },
  { id: 1004008, name: "禮帽" },
  { id: 1004009, name: "鬥牛士帽" },
  { id: 1004010, name: "海盜頭巾" },
  // 髮飾
  { id: 1005180, name: "蝴蝶結" },
  { id: 1005181, name: "花環" },
  { id: 1005182, name: "髮箍" },
  // 高級
  { id: 1003800, name: "皇家貝雷" },
  { id: 1003900, name: "公主皇冠" },
  { id: 1003901, name: "王子皇冠" },
];

export const TOPS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  // 基本款
  { id: 1040000, name: "灰襯衫" },
  { id: 1040002, name: "白襯衫" },
  { id: 1040003, name: "黑襯衫" },
  { id: 1040036, name: "黑色 T" },
  { id: 1040037, name: "白色 T" },
  { id: 1040038, name: "紅色 T" },
  // 運動
  { id: 1041002, name: "綠色運動衣" },
  { id: 1041003, name: "藍色運動衣" },
  { id: 1041004, name: "紅色運動衣" },
  // 戰士
  { id: 1042003, name: "皮甲" },
  { id: 1042004, name: "鎖甲" },
  { id: 1042100, name: "騎士甲" },
  { id: 1042129, name: "暗黑斗篷" },
  // 海盜
  { id: 1042200, name: "海盜外套" },
  { id: 1042201, name: "海盜風衣" },
  // 古老 / 棒球
  { id: 1042254, name: "古老套裝 上" },
  { id: 1042255, name: "古老紫袍" },
  { id: 1042257, name: "棒球外套" },
  { id: 1042258, name: "薩滿上衣" },
  // 套裝
  { id: 1042150, name: "禮服上衣 男" },
  { id: 1042151, name: "禮服上衣 女" },
  { id: 1042160, name: "和服男" },
  { id: 1042161, name: "和服女" },
  // 校園
  { id: 1042170, name: "校服男" },
  { id: 1042171, name: "校服女" },
  // 戰士類
  { id: 1042180, name: "騎士袍" },
  { id: 1042181, name: "魔法袍" },
];

export const BOTTOMS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1060002, name: "藍長褲" },
  { id: 1060003, name: "黑長褲" },
  { id: 1060026, name: "黑色窄管" },
  { id: 1060027, name: "棕色長褲" },
  { id: 1061002, name: "綠色短褲" },
  { id: 1061003, name: "藍色短褲" },
  { id: 1062007, name: "皮甲褲" },
  { id: 1062100, name: "騎士甲褲" },
  { id: 1062112, name: "白色裙" },
  { id: 1062150, name: "禮服裙" },
  { id: 1062165, name: "古老套裝 褲" },
  { id: 1062168, name: "藍色短裙" },
  { id: 1062169, name: "格子裙" },
  { id: 1062200, name: "海盜褲" },
  { id: 1062170, name: "校服褲 男" },
  { id: 1062171, name: "校服裙 女" },
  { id: 1062180, name: "和服裙" },
  { id: 1062270, name: "公主長裙" },
];

export const OVERALLS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1050018, name: "簡單藍洋裝" },
  { id: 1050081, name: "白色洋裝" },
  { id: 1050082, name: "粉紅洋裝" },
  { id: 1050100, name: "紅色禮服" },
  { id: 1050101, name: "藍色禮服" },
  { id: 1050150, name: "校園連身" },
  { id: 1050170, name: "貓咪連身衣" },
  { id: 1050171, name: "狐狸連身衣" },
  { id: 1050200, name: "和服 (粉)" },
  { id: 1050201, name: "和服 (藍)" },
  { id: 1052006, name: "戰士全身鎧" },
  { id: 1052007, name: "騎士鎧甲" },
  { id: 1053650, name: "魔法師長袍" },
  { id: 1053651, name: "黑色法袍" },
  { id: 1053652, name: "紅色法袍" },
  { id: 1053700, name: "公主裙" },
];

export const SHOES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1072001, name: "棕色皮鞋" },
  { id: 1072005, name: "綠色靴" },
  { id: 1072025, name: "白色高跟" },
  { id: 1072026, name: "紅色高跟" },
  { id: 1072039, name: "運動鞋" },
  { id: 1072040, name: "白色運動鞋" },
  { id: 1072100, name: "騎士靴" },
  { id: 1072200, name: "海盜靴" },
  { id: 1072740, name: "魔法師涼鞋" },
  { id: 1072741, name: "薩滿涼鞋" },
  { id: 1073158, name: "古老靴" },
  { id: 1072300, name: "和服木屐" },
  { id: 1072400, name: "公主鞋" },
];

export const CAPES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1102039, name: "紅披風" },
  { id: 1102040, name: "藍披風" },
  { id: 1102041, name: "黑披風" },
  { id: 1102484, name: "綠斗篷" },
  { id: 1102775, name: "古老披風" },
  { id: 1102940, name: "黑色長披" },
  { id: 1102100, name: "騎士披風" },
  { id: 1102200, name: "魔法師斗篷" },
  { id: 1102300, name: "蝴蝶翅膀" },
  { id: 1102301, name: "天使翼" },
  { id: 1102302, name: "惡魔翼" },
];

export const GLOVES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1082002, name: "皮手套" },
  { id: 1082003, name: "鎖鏈手套" },
  { id: 1082100, name: "騎士手套" },
  { id: 1082636, name: "白手套" },
  { id: 1082695, name: "古老手套" },
  { id: 1082200, name: "紅手套" },
  { id: 1082201, name: "黑手套" },
];

export const WEAPONS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  // 餐廳道具（廚刀、平底鍋）
  { id: 1422022, name: "平底鍋" },
  { id: 1442075, name: "長槍 (廚 spear)" },
  // 一般武器
  { id: 1302000, name: "木劍" },
  { id: 1302001, name: "短劍" },
  { id: 1302020, name: "雙劍" },
  { id: 1312000, name: "短斧" },
  { id: 1312001, name: "戰斧" },
  { id: 1322000, name: "棍棒" },
  { id: 1322001, name: "鐵棍" },
  { id: 1332000, name: "短刀" },
  { id: 1332001, name: "雙刀" },
  // 法師
  { id: 1372003, name: "法杖 (初級)" },
  { id: 1372013, name: "魔法之杖" },
  { id: 1382000, name: "藤條" },
  { id: 1382020, name: "魔導書" },
  // 大型
  { id: 1402259, name: "兩手大劍" },
  { id: 1412000, name: "兩手斧" },
  { id: 1442268, name: "槍械" },
  // 弓 / 弩
  { id: 1452002, name: "短弓" },
  { id: 1452003, name: "長弓" },
  { id: 1462000, name: "弩" },
  // 雙刀
  { id: 1472000, name: "暗器" },
  { id: 1482000, name: "拳套" },
  // 海盜
  { id: 1492000, name: "雙槍" },
  { id: 1492001, name: "炮" },
];

export const FACE_ACCESSORIES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1012438, name: "黑面具" },
  { id: 1012478, name: "圓眼鏡" },
  { id: 1012636, name: "墨鏡" },
  { id: 1012672, name: "閃亮裝飾" },
  { id: 1012757, name: "面罩" },
  { id: 1012100, name: "口罩" },
  { id: 1012101, name: "醫療口罩" },
  { id: 1012200, name: "腮紅" },
  { id: 1012201, name: "雀斑" },
  { id: 1012300, name: "鬍鬚" },
  { id: 1012301, name: "落腮鬍" },
];

export const EYE_ACCESSORIES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1022232, name: "圓眼鏡" },
  { id: 1022211, name: "方眼鏡" },
  { id: 1022231, name: "墨鏡" },
  { id: 1022100, name: "金邊圓鏡" },
  { id: 1022101, name: "半月眼鏡" },
  { id: 1022150, name: "貓眼鏡" },
  { id: 1022200, name: "護目鏡" },
];

export const EARRINGS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1032136, name: "金色耳環" },
  { id: 1032223, name: "紅耳環" },
  { id: 1032330, name: "鑽石耳環" },
  { id: 1032100, name: "珍珠耳環" },
  { id: 1032101, name: "翡翠耳環" },
  { id: 1032102, name: "蝴蝶結耳環" },
  { id: 1032103, name: "羽毛耳環" },
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
  cape: "披風 / 翅膀",
  gloves: "手套",
  weapon: "武器",
  faceAccessory: "臉部飾品",
  eyeAccessory: "眼鏡",
  earrings: "耳環",
};
