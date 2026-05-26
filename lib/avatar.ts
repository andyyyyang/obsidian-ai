import type { AvatarConfig } from "@prisma/client";
import { DEFAULT_MAPLE_LOOK, deterministicMapleLook, MapleLook } from "./maple-avatar";

export function configToLook(config: AvatarConfig | null): MapleLook {
  if (!config) return DEFAULT_MAPLE_LOOK;
  return {
    bodyId: config.bodyId,
    headId: config.headId,
    faceId: config.faceId,
    hairId: config.hairId,
    hatId: config.hatId,
    topId: config.topId,
    bottomId: config.bottomId,
    overallId: config.overallId,
    shoesId: config.shoesId,
    capeId: config.capeId,
    glovesId: config.glovesId,
    weaponId: config.weaponId,
    faceAccessoryId: config.faceAccessoryId,
    eyeAccessoryId: config.eyeAccessoryId,
    earringsId: config.earringsId,
  };
}

export function configToVersion(config: AvatarConfig | null): string {
  return config?.version ?? "222";
}

/** 由員工 id 計算 deterministic 預設外觀（沒設定的人也能有個樣子） */
export function deterministicLook(seed: string): MapleLook {
  return deterministicMapleLook(seed);
}
