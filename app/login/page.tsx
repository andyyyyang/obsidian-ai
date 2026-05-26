import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect("/");
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background: "linear-gradient(180deg, #2b1810 0%, #5a3a1f 50%, #3d2510 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* 標題招牌 */}
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
                textShadow:
                  "2px 2px 0 #5a2510, -1px -1px 0 #5a2510, 1px -1px 0 #5a2510, -1px 1px 0 #5a2510",
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
          <div
            className="rounded-[1.4rem] p-7"
            style={{
              background: "linear-gradient(180deg, #fdf6e8 0%, #f5e9c8 100%)",
              border: "2px solid #5a3a1f",
            }}
          >
            <div className="mb-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-amber-900">
              ─── 員 工 登 入 ───
            </div>
            <LoginForm />
            <div className="mt-5 border-t border-amber-200/60 pt-4 text-center text-[11px] text-amber-800/70">
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
