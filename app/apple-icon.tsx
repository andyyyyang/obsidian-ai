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
          background: "linear-gradient(145deg, #fafafa 0%, #d4d4d4 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="caseBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="55%" stopColor="#1e1e1e" />
              <stop offset="100%" stopColor="#060606" />
            </linearGradient>
            <linearGradient id="caseHandle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d3d3d" />
              <stop offset="100%" stopColor="#141414" />
            </linearGradient>
            <linearGradient id="caseShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <radialGradient id="plate" cx="0.5" cy="0.35" r="0.6">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* 背景底光（放射狀，給整張 icon 一點深度） */}
          <rect x="0" y="0" width="180" height="180" fill="url(#plate)" />

          {/* 公事包提把 */}
          <path
            d="M68 54 Q68 36 90 36 Q112 36 112 54"
            stroke="url(#caseHandle)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M68 54 Q68 36 90 36 Q112 36 112 54"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            transform="translate(0,-2)"
          />

          {/* 公事包主體 */}
          <path
            d="M34 62 Q34 54 42 54 L138 54 Q146 54 146 62 L146 136 Q146 150 132 150 L48 150 Q34 150 34 136 Z"
            fill="url(#caseBody)"
          />

          {/* 頂部光澤 */}
          <path
            d="M40 62 Q40 60 42 60 L138 60 Q140 60 140 62 L140 90 Q140 92 138 92 L42 92 Q40 92 40 90 Z"
            fill="url(#caseShine)"
          />

          {/* 中央扣件/鎖扣 */}
          <rect
            x="80"
            y="98"
            width="20"
            height="12"
            rx="3"
            fill="#2a2a2a"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          <rect
            x="85"
            y="101"
            width="10"
            height="2.5"
            rx="1.2"
            fill="rgba(255,255,255,0.5)"
          />

          {/* 下方分隔線 */}
          <path
            d="M34 120 L146 120"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
