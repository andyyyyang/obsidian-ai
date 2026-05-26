/**
 * Curated MapleStory item list — 給紙娃娃編輯器顯示的菜單
 *
 * 全部用 maplestory.io v222 規範。
 * 範圍備忘：
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
 *
 * 若 maplestory.io 沒這 item，編輯器 icon 會 onError 變半透明，
 * 但不會炸頁面 — 使用者就跳過該選項。
 */

export type MapleItemOption = { id: number; name: string };

// 四種膚色 — body / head 必須一起換
export const SKINS: { name: string; bodyId: number; headId: number }[] = [
  { name: "亮膚", bodyId: 2000, headId: 12000 },
  { name: "蒼白", bodyId: 2001, headId: 12001 },
  { name: "小麥", bodyId: 2002, headId: 12002 },
  { name: "深膚", bodyId: 2003, headId: 12003 },
];

// ──────────────── 表情 (40+) ────────────────
export const FACES: MapleItemOption[] = [
  { id: 20000, name: "預設笑" },
  { id: 20001, name: "微笑" },
  { id: 20002, name: "驚訝" },
  { id: 20003, name: "認真" },
  { id: 20004, name: "閃亮眼" },
  { id: 20005, name: "酷臉" },
  { id: 20006, name: "張嘴" },
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
  { id: 20028, name: "煩惱" },
  { id: 20030, name: "貓眼" },
  { id: 20034, name: "認真凝視" },
  { id: 20040, name: "怒目" },
  { id: 20050, name: "炯炯" },
  { id: 20060, name: "閃亮女款" },
  { id: 20070, name: "驚嚇" },
  { id: 20080, name: "天使笑" },
  { id: 20100, name: "Hi!" },
  { id: 20110, name: "甜甜微笑" },
  { id: 20114, name: "邪魅" },
  { id: 21000, name: "閃亮 女" },
  { id: 21001, name: "嬌羞" },
  { id: 21002, name: "嘻嘻" },
  { id: 21003, name: "委屈" },
  { id: 21004, name: "雀躍" },
  { id: 21005, name: "微笑女" },
  { id: 21030, name: "可愛萌" },
  { id: 21050, name: "公主笑" },
  { id: 21100, name: "夢幻" },
  { id: 21300, name: "閉眼幸福" },
];

// ──────────────── 髮型 (60+) ────────────────
export const HAIRS: MapleItemOption[] = [
  // 黑色系
  { id: 30000, name: "黑色短" },
  { id: 30010, name: "黑色刺蝟" },
  { id: 30020, name: "黑色蓬鬆" },
  { id: 30030, name: "黑色貝雷" },
  { id: 30040, name: "黑色中分" },
  { id: 30050, name: "黑色俏皮" },
  { id: 30060, name: "黑色清爽" },
  { id: 30150, name: "中長黑" },
  { id: 30180, name: "黑色霸氣" },
  { id: 30200, name: "黑色斜瀏海" },
  { id: 30220, name: "黑色俏皮短" },
  { id: 30270, name: "捲短" },
  { id: 30630, name: "黑色公主切" },
  // 白色系
  { id: 31000, name: "白短" },
  { id: 31002, name: "白色長" },
  { id: 31030, name: "白色貝雷" },
  { id: 31130, name: "白短霸氣" },
  { id: 31150, name: "白色中分" },
  { id: 31250, name: "銀白長髮" },
  { id: 31480, name: "銀短斜" },
  { id: 31550, name: "銀色雙馬尾" },
  // 金色系
  { id: 32000, name: "金色長" },
  { id: 32030, name: "金色俏皮" },
  { id: 32050, name: "金色慵懶" },
  { id: 32450, name: "金色波浪" },
  { id: 32650, name: "金色公主長" },
  // 紅色系
  { id: 33000, name: "紅短" },
  { id: 33020, name: "紅色火焰" },
  { id: 33050, name: "紅色狂野" },
  { id: 33150, name: "紅色海軍" },
  { id: 33360, name: "紅色波浪" },
  { id: 33550, name: "緋紅雙馬尾" },
  // 綠色系
  { id: 34000, name: "綠短" },
  { id: 34020, name: "綠雙馬尾" },
  { id: 34150, name: "綠色精靈" },
  // 藍色系
  { id: 35000, name: "藍色長" },
  { id: 35020, name: "藍色俏皮" },
  { id: 35150, name: "海藍長髮" },
  { id: 35480, name: "藍色優雅長髮" },
  // 粉色系 (最受歡迎)
  { id: 36000, name: "粉短" },
  { id: 36050, name: "粉色俏皮" },
  { id: 36082, name: "粉色雙馬尾" },
  { id: 36100, name: "粉色公主" },
  { id: 36180, name: "粉色甜美短" },
  { id: 36320, name: "粉色公主長" },
  { id: 36500, name: "粉紅櫻花" },
  // 紫色系
  { id: 37000, name: "紫短" },
  { id: 37020, name: "紫色蓬鬆" },
  { id: 37050, name: "紫色長" },
  { id: 37250, name: "紫色女王" },
  // 棕色系
  { id: 38000, name: "棕短" },
  { id: 38050, name: "棕色波浪" },
  { id: 38100, name: "棕色丸子" },
  { id: 38200, name: "棕色高貴" },
  // 特殊 (cosplay / cash)
  { id: 39000, name: "紫粉混" },
  { id: 40000, name: "雙馬尾橙" },
  { id: 41000, name: "甜美捲" },
  { id: 45000, name: "公主長" },
  { id: 45050, name: "皇后髮" },
  { id: 46000, name: "貓耳髮" },
  { id: 47000, name: "皇室長髮" },
  { id: 47547, name: "霧氣優雅" },
  { id: 48000, name: "夢幻雙馬尾" },
  { id: 49000, name: "天使捲" },
];

// ──────────────── 帽子 (50+) ────────────────
export const HATS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  // 餐廳職業
  { id: 1004032, name: "廚師帽" },
  { id: 1004036, name: "棒球帽" },
  { id: 1005006, name: "兔耳髮帶" },
  // 動物耳
  { id: 1005168, name: "貓耳" },
  { id: 1005169, name: "熊耳" },
  { id: 1005170, name: "狐狸耳" },
  { id: 1005171, name: "兔耳粉" },
  { id: 1005172, name: "狼耳" },
  { id: 1005228, name: "熊貓耳" },
  { id: 1005230, name: "綿羊耳" },
  { id: 1005250, name: "鹿角" },
  { id: 1005280, name: "獨角獸" },
  // 經典
  { id: 1002357, name: "巫師帽" },
  { id: 1003351, name: "聖誕帽" },
  { id: 1003797, name: "皇冠 金" },
  { id: 1003800, name: "皇冠 銀" },
  { id: 1003900, name: "公主皇冠" },
  { id: 1003901, name: "王子皇冠" },
  // 一般帽
  { id: 1002140, name: "圓帽 紅" },
  { id: 1002452, name: "睡帽" },
  { id: 1005668, name: "黑色貝雷" },
  { id: 1005923, name: "草帽" },
  { id: 1003118, name: "海盜帽" },
  { id: 1003801, name: "黑色三角" },
  // 時尚
  { id: 1004003, name: "紳士禮帽" },
  { id: 1004004, name: "牛仔帽" },
  { id: 1004005, name: "貝蕾帽 條紋" },
  { id: 1004006, name: "騎士頭盔" },
  { id: 1004007, name: "毛線帽" },
  { id: 1004008, name: "高貴禮帽" },
  { id: 1004009, name: "鬥牛士帽" },
  { id: 1004010, name: "海盜頭巾" },
  { id: 1004011, name: "貝蕾 粉" },
  { id: 1004012, name: "貝蕾 黑" },
  { id: 1004020, name: "毛茸茸帽" },
  { id: 1004060, name: "魔法少女帽" },
  // 髮飾
  { id: 1005180, name: "蝴蝶結" },
  { id: 1005181, name: "花環" },
  { id: 1005182, name: "髮箍" },
  { id: 1005200, name: "公主髮帶" },
  { id: 1005201, name: "天使光環" },
  { id: 1005202, name: "惡魔角" },
  { id: 1005203, name: "髮夾組" },
  { id: 1005230, name: "蝴蝶髮飾" },
  // 萬聖節 / 節慶
  { id: 1003114, name: "南瓜頭" },
  { id: 1003115, name: "巫師帽 紫" },
  { id: 1003116, name: "馴鹿角" },
  { id: 1003117, name: "雪花髮夾" },
  // 軍/警/特殊
  { id: 1004100, name: "警察帽" },
  { id: 1004101, name: "護士帽" },
  { id: 1004102, name: "醫師帽" },
  { id: 1004103, name: "海軍帽" },
];

// ──────────────── 上衣 (40+) ────────────────
export const TOPS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1040000, name: "灰襯衫" },
  { id: 1040002, name: "白襯衫" },
  { id: 1040003, name: "黑襯衫" },
  { id: 1040036, name: "黑色 T" },
  { id: 1040037, name: "白色 T" },
  { id: 1040038, name: "紅色 T" },
  { id: 1040039, name: "黃色 T" },
  { id: 1040040, name: "綠色 T" },
  { id: 1041002, name: "綠運動衣" },
  { id: 1041003, name: "藍運動衣" },
  { id: 1041004, name: "紅運動衣" },
  { id: 1041100, name: "校服上衣 男" },
  { id: 1041101, name: "校服上衣 女" },
  { id: 1042003, name: "皮甲" },
  { id: 1042004, name: "鎖甲" },
  { id: 1042100, name: "騎士甲" },
  { id: 1042129, name: "暗黑斗篷" },
  { id: 1042150, name: "禮服上衣 男" },
  { id: 1042151, name: "禮服上衣 女" },
  { id: 1042160, name: "和服 男" },
  { id: 1042161, name: "和服 女" },
  { id: 1042170, name: "校服男 立領" },
  { id: 1042171, name: "校服女 水手" },
  { id: 1042180, name: "騎士袍" },
  { id: 1042181, name: "魔法袍 紫" },
  { id: 1042182, name: "魔法袍 紅" },
  { id: 1042200, name: "海盜外套" },
  { id: 1042201, name: "海盜風衣" },
  { id: 1042254, name: "古老套裝 上" },
  { id: 1042255, name: "古老紫袍" },
  { id: 1042257, name: "棒球外套" },
  { id: 1042258, name: "薩滿上衣" },
  { id: 1042300, name: "T恤 條紋" },
  { id: 1042301, name: "T恤 海軍" },
  { id: 1042340, name: "中國服 男" },
  { id: 1042341, name: "中國服 女" },
  { id: 1042400, name: "夏日無袖" },
  { id: 1042500, name: "甜美荷葉邊" },
  { id: 1042600, name: "冬季毛衣" },
  { id: 1042700, name: "正式西裝" },
];

// ──────────────── 褲子 / 裙 (30+) ────────────────
export const BOTTOMS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1060002, name: "藍長褲" },
  { id: 1060003, name: "黑長褲" },
  { id: 1060026, name: "黑色窄管" },
  { id: 1060027, name: "棕色長褲" },
  { id: 1060040, name: "白色西裝褲" },
  { id: 1060100, name: "校服褲 男" },
  { id: 1060200, name: "牛仔褲" },
  { id: 1061002, name: "綠色短褲" },
  { id: 1061003, name: "藍色短褲" },
  { id: 1061100, name: "夏日短褲" },
  { id: 1062007, name: "皮甲褲" },
  { id: 1062100, name: "騎士甲褲" },
  { id: 1062112, name: "白色裙" },
  { id: 1062150, name: "禮服裙" },
  { id: 1062165, name: "古老套裝 褲" },
  { id: 1062168, name: "藍色短裙" },
  { id: 1062169, name: "格子裙" },
  { id: 1062170, name: "校服褲 男" },
  { id: 1062171, name: "校服裙 水手" },
  { id: 1062180, name: "和服裙" },
  { id: 1062200, name: "海盜褲" },
  { id: 1062270, name: "公主長裙" },
  { id: 1062300, name: "蓬蓬裙" },
  { id: 1062350, name: "迷你裙" },
  { id: 1062400, name: "中式裙" },
];

// ──────────────── 連身 (30+ 含 cosplay) ────────────────
export const OVERALLS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  // 基本款
  { id: 1050018, name: "簡單藍洋裝" },
  { id: 1050081, name: "白色洋裝" },
  { id: 1050082, name: "粉紅洋裝" },
  { id: 1050083, name: "黃色洋裝" },
  { id: 1050100, name: "紅色禮服" },
  { id: 1050101, name: "藍色禮服" },
  { id: 1050102, name: "綠色禮服" },
  // 婚紗 / 正式
  { id: 1050130, name: "婚紗 (新娘)" },
  { id: 1050131, name: "燕尾服 (新郎)" },
  // 校園
  { id: 1050150, name: "校園連身" },
  { id: 1050151, name: "水手服 連身" },
  // 動物連身
  { id: 1050170, name: "貓咪連身衣" },
  { id: 1050171, name: "狐狸連身衣" },
  { id: 1050172, name: "兔兔連身衣" },
  { id: 1050173, name: "熊熊連身衣" },
  // 和風
  { id: 1050200, name: "和服 (粉)" },
  { id: 1050201, name: "和服 (藍)" },
  { id: 1050202, name: "和服 (紅)" },
  // 中國風
  { id: 1050300, name: "旗袍 (紅)" },
  { id: 1050301, name: "旗袍 (藍)" },
  // 戰士
  { id: 1052006, name: "戰士全身鎧" },
  { id: 1052007, name: "騎士鎧甲" },
  { id: 1053650, name: "魔法師長袍" },
  { id: 1053651, name: "黑色法袍" },
  { id: 1053652, name: "紅色法袍" },
  { id: 1053700, name: "公主裙" },
  // 職業 cosplay
  { id: 1052020, name: "女僕裝" },
  { id: 1052070, name: "水手服" },
  { id: 1052080, name: "學生制服" },
  { id: 1052100, name: "護士服" },
  { id: 1052150, name: "空姐裝" },
  { id: 1052200, name: "古代戰甲" },
  { id: 1052250, name: "魔法少女裝" },
  { id: 1052300, name: "泳衣 比基尼" },
  { id: 1052400, name: "冬季長外套" },
  { id: 1052500, name: "畢業禮服" },
  // 萬聖節
  { id: 1052600, name: "巫女服" },
  { id: 1052601, name: "吸血鬼禮服" },
];

// ──────────────── 鞋子 (20+) ────────────────
export const SHOES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1072001, name: "棕色皮鞋" },
  { id: 1072005, name: "綠色靴" },
  { id: 1072025, name: "白色高跟" },
  { id: 1072026, name: "紅色高跟" },
  { id: 1072027, name: "黑色高跟" },
  { id: 1072039, name: "運動鞋" },
  { id: 1072040, name: "白色運動鞋" },
  { id: 1072100, name: "騎士靴" },
  { id: 1072150, name: "羅馬涼鞋" },
  { id: 1072200, name: "海盜靴" },
  { id: 1072250, name: "短靴" },
  { id: 1072300, name: "和服木屐" },
  { id: 1072350, name: "中式繡花鞋" },
  { id: 1072400, name: "公主鞋" },
  { id: 1072450, name: "甜美瑪麗珍" },
  { id: 1072500, name: "雪靴" },
  { id: 1072550, name: "夏日涼拖" },
  { id: 1072600, name: "皮靴" },
  { id: 1072700, name: "舞鞋" },
  { id: 1072740, name: "魔法師涼鞋" },
  { id: 1072741, name: "薩滿涼鞋" },
  { id: 1073158, name: "古老靴" },
];

// ──────────────── 披風 / 翅膀 (20+) ────────────────
export const CAPES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1102039, name: "紅披風" },
  { id: 1102040, name: "藍披風" },
  { id: 1102041, name: "黑披風" },
  { id: 1102042, name: "白披風" },
  { id: 1102100, name: "騎士披風" },
  { id: 1102139, name: "天使小翼" },
  { id: 1102140, name: "惡魔小翼" },
  { id: 1102150, name: "蝶翼 紫" },
  { id: 1102158, name: "蝶翼 粉" },
  { id: 1102200, name: "魔法師斗篷" },
  { id: 1102201, name: "黑魔法斗篷" },
  { id: 1102300, name: "蝴蝶翅膀大" },
  { id: 1102301, name: "天使翅膀" },
  { id: 1102302, name: "惡魔翅膀" },
  { id: 1102303, name: "鳳凰翅膀" },
  { id: 1102304, name: "蜻蜓翅膀" },
  { id: 1102400, name: "聖光斗篷" },
  { id: 1102484, name: "綠斗篷" },
  { id: 1102500, name: "校園披風" },
  { id: 1102775, name: "古老披風" },
  { id: 1102940, name: "黑色長披" },
];

// ──────────────── 手套 (15+) ────────────────
export const GLOVES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1082002, name: "皮手套" },
  { id: 1082003, name: "鎖鏈手套" },
  { id: 1082100, name: "騎士手套" },
  { id: 1082150, name: "魔法手套" },
  { id: 1082200, name: "紅手套" },
  { id: 1082201, name: "黑手套" },
  { id: 1082202, name: "白手套 禮儀" },
  { id: 1082203, name: "格紋手套" },
  { id: 1082204, name: "毛茸茸手套" },
  { id: 1082300, name: "拳擊手套" },
  { id: 1082400, name: "和服手套" },
  { id: 1082500, name: "公主蕾絲手套" },
  { id: 1082636, name: "白手套" },
  { id: 1082695, name: "古老手套" },
];

// ──────────────── 武器 (40+) ────────────────
export const WEAPONS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  // 餐廳道具
  { id: 1422022, name: "平底鍋" },
  { id: 1422023, name: "巨型菜刀" },
  { id: 1422024, name: "肉鎚" },
  { id: 1442075, name: "長槍" },
  // 劍類
  { id: 1302000, name: "木劍" },
  { id: 1302001, name: "短劍" },
  { id: 1302020, name: "雙劍" },
  { id: 1302100, name: "華麗短劍" },
  { id: 1402000, name: "兩手劍 基本" },
  { id: 1402259, name: "兩手大劍 古" },
  // 斧
  { id: 1312000, name: "短斧" },
  { id: 1312001, name: "戰斧" },
  { id: 1412000, name: "兩手斧" },
  // 鈍器
  { id: 1322000, name: "棍棒" },
  { id: 1322001, name: "鐵棍" },
  { id: 1422000, name: "大鎚" },
  { id: 1422050, name: "掃帚" },
  // 短刀
  { id: 1332000, name: "短刀" },
  { id: 1332001, name: "雙刀" },
  // 法杖類
  { id: 1372003, name: "法杖 初級" },
  { id: 1372013, name: "魔法之杖" },
  { id: 1372040, name: "星星法杖" },
  { id: 1372060, name: "魔法傘" },
  { id: 1382000, name: "藤條" },
  { id: 1382020, name: "魔導書" },
  { id: 1382040, name: "童話法杖" },
  // 弓 / 弩
  { id: 1452002, name: "短弓" },
  { id: 1452003, name: "長弓" },
  { id: 1452036, name: "華麗長弓" },
  { id: 1462000, name: "弩" },
  // 暗器
  { id: 1472000, name: "暗器" },
  // 拳套
  { id: 1482000, name: "拳套" },
  { id: 1482100, name: "金屬拳套" },
  // 海盜
  { id: 1492000, name: "雙槍" },
  { id: 1492001, name: "炮" },
  { id: 1492002, name: "雷射槍" },
  // 槍械
  { id: 1442268, name: "槍械" },
];

// ──────────────── 臉部飾品 (15+) ────────────────
export const FACE_ACCESSORIES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1012100, name: "口罩" },
  { id: 1012101, name: "醫療口罩" },
  { id: 1012102, name: "刺繡口罩" },
  { id: 1012200, name: "腮紅" },
  { id: 1012201, name: "雀斑" },
  { id: 1012202, name: "貓鬍鬚" },
  { id: 1012300, name: "鬍鬚" },
  { id: 1012301, name: "落腮鬍" },
  { id: 1012400, name: "貼紙星星" },
  { id: 1012401, name: "貼紙愛心" },
  { id: 1012438, name: "黑面具" },
  { id: 1012478, name: "圓邊裝飾" },
  { id: 1012500, name: "鼻環" },
  { id: 1012600, name: "面紗" },
  { id: 1012636, name: "墨鏡式" },
  { id: 1012672, name: "閃亮裝飾" },
  { id: 1012757, name: "面罩" },
];

// ──────────────── 眼鏡 (10+) ────────────────
export const EYE_ACCESSORIES: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1022100, name: "金邊圓鏡" },
  { id: 1022101, name: "半月眼鏡" },
  { id: 1022150, name: "貓眼鏡" },
  { id: 1022200, name: "護目鏡" },
  { id: 1022211, name: "方眼鏡" },
  { id: 1022231, name: "墨鏡" },
  { id: 1022232, name: "圓眼鏡" },
  { id: 1022250, name: "心型眼鏡" },
  { id: 1022300, name: "派對面具" },
  { id: 1022400, name: "海盜獨眼" },
];

// ──────────────── 耳環 (12+) ────────────────
export const EARRINGS: MapleItemOption[] = [
  { id: 0, name: "(無)" },
  { id: 1032100, name: "珍珠耳環" },
  { id: 1032101, name: "翡翠耳環" },
  { id: 1032102, name: "蝴蝶結耳環" },
  { id: 1032103, name: "羽毛耳環" },
  { id: 1032104, name: "星星耳環" },
  { id: 1032105, name: "月亮耳環" },
  { id: 1032136, name: "金色耳環" },
  { id: 1032223, name: "紅耳環" },
  { id: 1032300, name: "心形耳環" },
  { id: 1032330, name: "鑽石耳環" },
  { id: 1032400, name: "花朵耳環" },
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

/** 快速套裝 — 一鍵變身 */
export type OutfitPreset = {
  name: string;
  emoji: string;
  partial: Partial<{
    faceId: number;
    hairId: number;
    hatId: number | null;
    topId: number | null;
    bottomId: number | null;
    overallId: number | null;
    shoesId: number | null;
    capeId: number | null;
    glovesId: number | null;
    weaponId: number | null;
    faceAccessoryId: number | null;
    eyeAccessoryId: number | null;
    earringsId: number | null;
  }>;
};

export const OUTFIT_PRESETS: OutfitPreset[] = [
  // 全部使用 PSSB-Bot 已驗證或 maplestory.io v222 常見可用 ID。
  // 核心元素: body 2000-2003 / head 12000-12003 / face 27038, 20000 系列 /
  //          hair 47547, 30030 系列 / overall 1053650 / hat 1005668, 1004032
  {
    name: "PSSB 標配 (驗證可用)",
    emoji: "✅",
    partial: {
      faceId: 27038,
      hairId: 47547,
      hatId: 1005668,
      overallId: 1053650,
      faceAccessoryId: 1012672,
      topId: null, bottomId: null, capeId: null, weaponId: null,
    },
  },
  {
    name: "主廚",
    emoji: "👨‍🍳",
    partial: {
      faceId: 20023,
      hairId: 30030,
      hatId: 1004032,
      overallId: 1053650,    // 用法袍當廚師服 (顏色協調)
      topId: null, bottomId: null,
      shoesId: null, weaponId: 1322000,
      capeId: null,
    },
  },
  {
    name: "巫師",
    emoji: "🧙",
    partial: {
      faceId: 27038,
      hairId: 47547,
      hatId: 1002357,        // 巫師帽
      overallId: 1053650,    // 法袍
      faceAccessoryId: 1012672,
      topId: null, bottomId: null, capeId: null,
    },
  },
  {
    name: "可愛貝雷",
    emoji: "🎀",
    partial: {
      faceId: 27038,
      hairId: 47547,
      hatId: 1005668,        // 黑色貝雷
      overallId: 1053650,
      faceAccessoryId: 1012672,
      topId: null, bottomId: null, capeId: null,
    },
  },
  {
    name: "皇冠公主",
    emoji: "👑",
    partial: {
      faceId: 27038,
      hairId: 47547,
      hatId: 1003797,        // 皇冠
      overallId: 1053650,
      topId: null, bottomId: null, capeId: null,
    },
  },
  {
    name: "聖誕風",
    emoji: "🎄",
    partial: {
      faceId: 20023,
      hairId: 30030,
      hatId: 1003351,        // 聖誕帽
      overallId: 1053650,
      topId: null, bottomId: null,
    },
  },
  {
    name: "簡單便服",
    emoji: "👕",
    partial: {
      faceId: 20000,
      hairId: 30030,
      hatId: null,
      overallId: null,
      topId: 1040002,        // 白襯衫
      bottomId: 1060002,     // 藍長褲
      shoesId: null, capeId: null, weaponId: null,
      faceAccessoryId: null,
    },
  },
  {
    name: "圓眼鏡 文青",
    emoji: "🤓",
    partial: {
      faceId: 20007,
      hairId: 30030,
      eyeAccessoryId: 1022232,  // 圓眼鏡 (常見可用)
      hatId: null,
      overallId: null,
      topId: 1040002,
      bottomId: 1060002,
    },
  },
];
