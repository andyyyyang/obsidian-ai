import { NextResponse, type NextRequest } from "next/server";

// 簡單版：未帶 session cookie 的請求若想存取需登入頁面，導向 /login
// 真正的身分驗證仍在 server component / API route 內進行
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("leave_session");

  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    // iCal 訂閱連結用自己的 HMAC token 認證，不需 cookie
    pathname.startsWith("/api/calendar/ical/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    // Next.js app router 自動生成的 icon / manifest 路由（未登入也要能讀，PWA 加主畫面才有圖）
    pathname === "/icon" ||
    pathname.startsWith("/icon.") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon.") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json";

  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
