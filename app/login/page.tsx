import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { buildMapleAvatarUrl, DEFAULT_MAPLE_LOOK } from "@/lib/maple-avatar";
import { buildMapleMapUrl, LOGIN_MAPS } from "@/lib/maple-maps";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/");
  }

  // 預先建好登入頁要用的所有 URL
  const mapBackgrounds = LOGIN_MAPS.map((m) => ({
    ...m,
    url: buildMapleMapUrl(m.id),
  }));

  // 登入頁的 mascot character — 主廚樣
  const mascotUrl = buildMapleAvatarUrl(
    {
      ...DEFAULT_MAPLE_LOOK,
      bodyId: 2000,
      headId: 12000,
      faceId: 20023, // 燦笑
      hairId: 30030,
      hatId: 1004032, // 廚師帽
      overallId: 1053650, // 法袍
      shoesId: 1072740,
      weaponId: 1322000,
    },
    { stance: "stand1", frame: 0, resize: 2 },
  );

  const mascot2Url = buildMapleAvatarUrl(
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
    { stance: "stand1", frame: 0, resize: 2, flipX: true },
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* 楓谷地圖背景 (full-bleed) */}
      <div className="absolute inset-0 -z-10">
        <img
          src={mapBackgrounds[0].url}
          alt="背景"
          className="h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
        {/* 暗化遮罩 — 讓中央登入框跳出來 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/60" />
      </div>

      {/* 兩側 mascot */}
      <div className="pointer-events-none absolute bottom-12 left-4 hidden md:block lg:left-16">
        <img
          src={mascotUrl}
          alt="主廚"
          style={{
            imageRendering: "pixelated",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
            height: 220,
          }}
        />
      </div>
      <div className="pointer-events-none absolute bottom-12 right-4 hidden md:block lg:right-16">
        <img
          src={mascot2Url}
          alt="外場"
          style={{
            imageRendering: "pixelated",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
            height: 220,
          }}
        />
      </div>

      {/* 中央登入面板 — 仿楓谷木牌窗 */}
      <div className="relative w-full max-w-md animate-fade-in">
        {/* 標題（懸浮在面板上方） */}
        <div className="mb-6 text-center">
          <div
            className="inline-block rounded-2xl px-6 py-2"
            style={{
              background: "linear-gradient(180deg, #f6b350 0%, #e87a2c 100%)",
              boxShadow: "0 8px 24px rgba(232,122,44,0.45), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.2)",
              border: "2px solid #5a2510",
            }}
          >
            <h1
              className="text-2xl font-black tracking-widest text-white sm:text-3xl"
              style={{
                textShadow: "2px 2px 0 #5a2510, 1px 1px 0 #5a2510, 0 0 8px rgba(255,255,255,0.3)",
                fontFamily: "'Press Start 2P', 'PingFang TC', sans-serif",
                letterSpacing: "0.15em",
              }}
            >
              楓 谷 餐 廳
            </h1>
          </div>
          <p className="mt-3 text-sm font-medium text-white drop-shadow-lg">
            Maple Diner ✦ 員工打卡系統
          </p>
        </div>

        {/* 木牌登入面板 */}
        <div
          className="relative rounded-3xl p-1"
          style={{
            background: "linear-gradient(180deg, #c89846 0%, #8b5a2b 100%)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <div
            className="rounded-[1.4rem] p-7"
            style={{
              background: "linear-gradient(180deg, #fdf6e8 0%, #f5e9c8 100%)",
              border: "2px solid #5a3a1f",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div className="mb-5 text-center text-xs font-bold uppercase tracking-widest text-amber-900">
              ─── 員工登入 ───
            </div>
            <LoginForm />
            <div className="mt-5 border-t border-amber-200/60 pt-4 text-center text-[11px] text-amber-800/70">
              忘記密碼？請洽店長重設
            </div>
          </div>
        </div>

        {/* 底部裝飾 */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] tracking-widest text-white/80 drop-shadow">
          <span>◆</span>
          <span>PRESS LOGIN TO START</span>
          <span>◆</span>
        </div>
      </div>
    </main>
  );
}
