import { ImageResponse } from "next/og";

// 瀏覽器分頁的 favicon（32×32）
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
          color: "white",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        休
      </div>
    ),
    { ...size },
  );
}
