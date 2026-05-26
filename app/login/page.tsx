import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { buildMapleAvatarUrl, DEFAULT_MAPLE_LOOK } from "@/lib/maple-avatar";
import { buildMapleMapUrl } from "@/lib/maple-maps";
import { LoginForm } from "./login-form";

// 自由市場 — 經典「市集」場景，攤位 + 招牌 + 拱門
const MARKET_MAP_ID = 910000000;

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/");
  }

  const marketMapUrl = buildMapleMapUrl(MARKET_MAP_ID);

  // 登入頁的兩個 mascot — 主廚 + 外場
  const chefMascotUrl = buildMapleAvatarUrl(
    {
      ...DEFAULT_MAPLE_LOOK,
      bodyId: 2000,
      headId: 12000,
      faceId: 20023,
      hairId: 30030,
      hatId: 1004032, // 廚師帽
      overallId: 1053650,
      shoesId: 1072740,
      weaponId: 1322000,
    },
    { stance: "stand1", frame: 0, resize: 1 },
  );

  const waiterMascotUrl = buildMapleAvatarUrl(
    {
      ...DEFAULT_MAPLE_LOOK,
      bodyId: 2001,
      headId: 12001,
      faceId: 20007,
      hairId: 36082,
      hatId: 1005006,
      topId: 1042257,
      bottomId: 1062168,
      shoesId: 1072025,
    },
    { stance: "stand1", frame: 0, resize: 1, flipX: true },
  );

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background: "linear-gradient(180deg, #2b1810 0%, #5a3a1f 50%, #3d2510 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* 標題招牌 — 浮在卡片上方 */}
        <div className="mb-5 text-center">
          <div
            className="inline-block rounded-2xl px-7 py-2.5"
            style={{
              background: "linear-gradient(180deg, #f6b350 0%, #e87a2c 100%)",
              boxShadow:
                "0 10px 24px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -3px 0 rgba(0,0,0,0.2)",
              border: "2.5px solid #5a2510",
            }}
          >
            <h1
              className="text-2xl font-black tracking-[0.25em] text-white sm:text-3xl"
              style={{
                textShadow: "2px 2px 0 #5a2510, -1px -1px 0 #5a2510, 1px -1px 0 #5a2510, -1px 1px 0 #5a2510",
              }}
            >
              楓 谷 餐 廳
            </h1>
          </div>
          <p className="mt-2 text-xs font-medium tracking-wider text-amber-200">
            ✦ Maple Diner ‧ 員工打卡系統 ✦
          </p>
        </div>

        {/* 木牌登入卡片 */}
        <div
          className="relative overflow-hidden rounded-3xl p-1"
          style={{
            background: "linear-gradient(180deg, #c89846 0%, #8b5a2b 100%)",
            boxShadow:
              "0 28px 70px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1.5px 0 rgba(0,0,0,0.25)",
          }}
        >
          {/* 上半：市集地圖橫幅 (固定高度) */}
          <div
            className="relative h-32 overflow-hidden rounded-t-[1.4rem]"
            style={{
              borderLeft: "2px solid #5a3a1f",
              borderTop: "2px solid #5a3a1f",
              borderRight: "2px solid #5a3a1f",
            }}
          >
            <img
              src={marketMapUrl}
              alt="自由市場"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(253,246,232,0.6) 95%, rgba(253,246,232,1) 100%)",
              }}
            />
            {/* 兩個小 mascot 站在地圖上 */}
            <img
              src={chefMascotUrl}
              alt="主廚"
              className="absolute bottom-1 left-6"
              style={{
                imageRendering: "pixelated",
                height: 70,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
              }}
            />
            <img
              src={waiterMascotUrl}
              alt="外場"
              className="absolute bottom-1 right-6"
              style={{
                imageRendering: "pixelated",
                height: 70,
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
              }}
            />
          </div>

          {/* 下半：登入表單區 */}
          <div
            className="rounded-b-[1.4rem] p-6"
            style={{
              background: "linear-gradient(180deg, #fdf6e8 0%, #f5e9c8 100%)",
              borderLeft: "2px solid #5a3a1f",
              borderRight: "2px solid #5a3a1f",
              borderBottom: "2px solid #5a3a1f",
            }}
          >
            <div className="mb-4 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-900">
              ─── 員 工 登 入 ───
            </div>
            <LoginForm />
            <div className="mt-4 border-t border-amber-200/60 pt-3 text-center text-[11px] text-amber-800/70">
              忘記密碼？請洽店長重設
            </div>
          </div>
        </div>

        {/* 底部復古字幕 */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] tracking-[0.3em] text-amber-200/70">
          <span>◆</span>
          <span>PRESS LOGIN TO START</span>
          <span>◆</span>
        </div>
      </div>
    </main>
  );
}
