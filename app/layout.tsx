import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "員工特休系統",
  description: "Employee leave management system",
  // iOS 加入主畫面後全螢幕（no Safari chrome）
  appleWebApp: {
    capable: true,
    title: "員工特休",
    statusBarStyle: "default",
  },
  // 一般 PWA
  manifest: "/manifest.webmanifest",
  // 其他平台也標記為 PWA
  applicationName: "員工特休系統",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
