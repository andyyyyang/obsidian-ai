import type { AvatarConfig } from "@prisma/client";
import { AvatarLook, DEFAULT_LOOK } from "./pixel-art";

export function configToLook(config: AvatarConfig | null): AvatarLook {
  if (!config) return DEFAULT_LOOK;
  return {
    skinTone: config.skinTone,
    hairStyle: config.hairStyle,
    hairColor: config.hairColor,
    shirtColor: config.shirtColor,
    pantsColor: config.pantsColor,
    shoeColor: config.shoeColor,
    eyeStyle: config.eyeStyle,
    hat: config.hat,
    glasses: config.glasses,
    backpack: config.backpack,
  };
}

/** 由員工 id 計算一個 deterministic 預設外觀（沒設定的人也能有個樣子） */
export function deterministicLook(seed: string): AvatarLook {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const r = (n: number) => {
    h = (h * 1103515245 + 12345) | 0;
    return Math.abs(h) % n;
  };
  return {
    skinTone: r(4),
    hairStyle: r(5),
    hairColor: r(8),
    shirtColor: r(8),
    pantsColor: r(8),
    shoeColor: r(4),
    eyeStyle: r(3),
    hat: null,
    glasses: null,
    backpack: false,
  };
}
