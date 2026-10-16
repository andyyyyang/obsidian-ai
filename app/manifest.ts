import type { MetadataRoute } from "next";

/**
 * PWA manifest — Next.js 15 app router 會自動把下方 icons 跟 app/icon.tsx /
 * app/apple-icon.tsx 整合（兩者都寫沒衝突，manifest 這組給 Android；
 * apple-icon.tsx 給 iOS，icon.tsx 給 favicon）。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "員工特休系統",
    short_name: "員工特休",
    description: "員工特休 / 請假管理系統",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6fb",
    theme_color: "#5e5ce6",
    orientation: "portrait",
    lang: "zh-Hant",
    icons: [
      // Android home screen 讀 192 / 512
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
