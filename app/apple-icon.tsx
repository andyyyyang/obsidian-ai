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
          background: "linear-gradient(145deg, #3a3a3a 0%, #0a0a0a 100%)",
          color: "#f5f5f5",
          // iOS 本身會套圓角，不用自己加 border-radius
          fontSize: 120,
          fontWeight: 800,
          fontFamily: "sans-serif",
          paddingBottom: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 上方光澤：模擬 glass icon 的 highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "48%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)",
            display: "flex",
          }}
        />
        {/* 底部微弱反射 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "25%",
            background:
              "linear-gradient(0deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)",
            display: "flex",
          }}
        />
        {/* 右上角裝飾小點（保留視覺層次） */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 14,
            height: 14,
            borderRadius: 7,
            background: "rgba(255,255,255,0.35)",
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
            background: "rgba(255,255,255,0.45)",
            display: "flex",
          }}
        />
        休
      </div>
    ),
    { ...size },
  );
}
