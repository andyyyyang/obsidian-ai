import { ImageResponse } from "next/og";

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
          background: "linear-gradient(145deg, #fafafa 0%, #d4d4d4 100%)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="miniCase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="100%" stopColor="#070707" />
            </linearGradient>
          </defs>
          {/* 提把 */}
          <path
            d="M12 10 Q12 6 16 6 Q20 6 20 10"
            stroke="#1a1a1a"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          {/* 主體 */}
          <rect x="5" y="10" width="22" height="17" rx="2.5" fill="url(#miniCase)" />
          {/* 頂光澤 */}
          <rect x="6" y="11" width="20" height="5" rx="1" fill="rgba(255,255,255,0.22)" />
          {/* 鎖扣 */}
          <rect x="14" y="17" width="4" height="2.5" rx="0.6" fill="rgba(255,255,255,0.45)" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
