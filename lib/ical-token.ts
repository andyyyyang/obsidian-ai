import { createHmac, timingSafeEqual } from "node:crypto";

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET not configured");
  return s;
}

function hmac(userId: string): Buffer {
  return createHmac("sha256", secret()).update(userId).digest();
}

/** 為某位使用者產生長效 iCal 訂閱 token（撤銷 = 輪換 SESSION_SECRET） */
export function signIcalToken(userId: string): string {
  return `${b64url(Buffer.from(userId))}.${b64url(hmac(userId))}`;
}

/** 驗證 token 並回傳 userId；失敗回 null */
export function verifyIcalToken(token: string): string | null {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  try {
    const userId = fromB64url(token.slice(0, dot)).toString("utf8");
    const provided = fromB64url(token.slice(dot + 1));
    const expected = hmac(userId);
    if (provided.length !== expected.length) return null;
    if (!timingSafeEqual(provided, expected)) return null;
    return userId;
  } catch {
    return null;
  }
}
