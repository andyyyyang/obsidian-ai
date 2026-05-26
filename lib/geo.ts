/**
 * 位置 / IP 驗證。
 */

import type { Office } from "@prisma/client";

const EARTH_RADIUS_M = 6371000;

/** Haversine 距離（公尺） */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type LocationCheckResult = {
  valid: boolean;
  reason?: string;
  distance?: number;
};

/**
 * 驗證打卡位置：GPS 距離 + IP 白名單，任一通過視為有效。
 * 若 office 未設定任何驗證條件則直接 valid。
 */
export function checkPunchLocation(
  office: Office,
  client: { latitude?: number | null; longitude?: number | null; ipAddress?: string | null },
): LocationCheckResult {
  const hasGps = office.latitude != null && office.longitude != null;
  const ipWhitelist = (office.ipWhitelist ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const hasIpRule = ipWhitelist.length > 0;

  if (!hasGps && !hasIpRule) {
    return { valid: true };
  }

  // IP 通過即可
  if (hasIpRule && client.ipAddress && ipWhitelist.includes(client.ipAddress)) {
    return { valid: true };
  }

  // 否則檢查 GPS
  if (hasGps && client.latitude != null && client.longitude != null) {
    const d = distanceMeters(
      office.latitude as number,
      office.longitude as number,
      client.latitude,
      client.longitude,
    );
    if (d <= office.radiusMeters) {
      return { valid: true, distance: Math.round(d) };
    }
    return {
      valid: false,
      reason: `距離公司 ${Math.round(d)} 公尺，超出允許範圍 ${office.radiusMeters} 公尺`,
      distance: Math.round(d),
    };
  }

  if (hasGps && (client.latitude == null || client.longitude == null)) {
    return { valid: false, reason: "未取得 GPS 位置，請允許瀏覽器定位權限" };
  }

  return { valid: false, reason: "IP 不在公司白名單內" };
}

/** 從 Next.js Request 取得客戶端 IP（支援常見 proxy header） */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    null
  );
}
