import { ImageResponse } from "next/og";

// iOS 加入主畫面 (180×180)、Android home screen 皆用這張
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)",
          color: "white",
          // iOS 本身會套圓角，不用自己加 border-radius
          fontSize: 120,
          fontWeight: 800,
          fontFamily: "sans-serif",
          // 字稍微上提視覺居中（中文方塊字 baseline 偏下）
          paddingBottom: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 右上角裝飾小點（視覺層次） */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: "rgba(255,255,255,0.3)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 42,
            width: 6,
            height: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.4)",
            display: "flex",
          }}
        />
        休
      </div>
    ),
    { ...size },
  );
}
