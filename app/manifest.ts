import type { MetadataRoute } from "next";

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
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
