/**
 * Glass-style icon set — 手工 SVG，模仿 nucleoapp 的 3D 玻璃質感
 *
 * 每個 icon:
 * - 24×24 viewBox，可以用 className="h-X w-X" 控制大小（跟 lucide-react 一樣）
 * - 深色漸層 base（頂亮底暗）+ 白色高光 overlay 製造立體感
 * - 用 unique gradient id 避免同頁多 icon 衝突
 * - 深色模式下自動變成「亮灰 base + 更亮高光」(由 .dark .glass-icon-stop- CSS variable 控制)
 *
 * 用法：
 *   import { CalendarIcon } from "@/components/icons/glass-icons";
 *   <CalendarIcon className="h-5 w-5" />
 */

import * as React from "react";

type IconProps = {
  size?: number | string;
  className?: string;
} & React.SVGAttributes<SVGSVGElement>;

const DARK_1 = "var(--gi-dark-1)";
const DARK_2 = "var(--gi-dark-2)";
const LIGHT_1 = "var(--gi-light-1)";
const LIGHT_2 = "var(--gi-light-2)";

function Svg({
  children,
  size = 24,
  className,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** 共用的 defs — 每個 icon 自己注入，id 用前綴避免衝突 */
function Defs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-d`} x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0" stopColor={DARK_1} />
        <stop offset="1" stopColor={DARK_2} />
      </linearGradient>
      <linearGradient id={`${idPrefix}-l`} x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0" stopColor={LIGHT_1} />
        <stop offset="1" stopColor={LIGHT_2} />
      </linearGradient>
    </defs>
  );
}

/* ─── Calendar ─── */
export function CalendarIcon(props: IconProps) {
  const p = "cal";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 上方深色 header */}
      <path
        d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4H4V6Z"
        fill={`url(#${p}-d)`}
      />
      {/* 下方亮白 body */}
      <path
        d="M4 10h16v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8Z"
        fill={`url(#${p}-l)`}
      />
      {/* 綁環 */}
      <rect x="7.5" y="1.5" width="2" height="4.5" rx="1" fill={`url(#${p}-d)`} />
      <rect x="14.5" y="1.5" width="2" height="4.5" rx="1" fill={`url(#${p}-d)`} />
      {/* 格點 */}
      <circle cx="9" cy="14.5" r="1" fill={DARK_1} opacity="0.5" />
      <circle cx="12" cy="14.5" r="1" fill={DARK_1} opacity="0.5" />
      <circle cx="15" cy="14.5" r="1" fill={DARK_1} opacity="0.5" />
    </Svg>
  );
}

/* ─── ClipboardList ─── */
export function ClipboardListIcon(props: IconProps) {
  const p = "clip";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 板子（亮） */}
      <rect x="4" y="4" width="16" height="18" rx="3" fill={`url(#${p}-l)`} />
      {/* 夾頭（暗） */}
      <path
        d="M9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5V5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V2.5Z"
        fill={`url(#${p}-d)`}
      />
      {/* 板上的 3 條條目線 */}
      <rect x="7.5" y="10" width="9" height="1.5" rx="0.75" fill={DARK_1} opacity="0.5" />
      <rect x="7.5" y="13.5" width="9" height="1.5" rx="0.75" fill={DARK_1} opacity="0.5" />
      <rect x="7.5" y="17" width="6" height="1.5" rx="0.75" fill={DARK_1} opacity="0.5" />
    </Svg>
  );
}

/* ─── BriefcaseBusiness ─── */
export function BriefcaseIcon(props: IconProps) {
  const p = "brief";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 手把 */}
      <path
        d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2h-2V4h-2v2H9V4Z"
        fill={`url(#${p}-d)`}
      />
      {/* 包身主體 */}
      <rect x="2.5" y="6" width="19" height="15" rx="3" fill={`url(#${p}-d)`} />
      {/* 中央亮橫條（扣件/隔板） */}
      <rect x="2.5" y="12" width="19" height="3" fill={`url(#${p}-l)`} opacity="0.9" />
      {/* 高光 */}
      <path d="M5 6h14l-1 2H6l-1-2Z" fill={LIGHT_1} opacity="0.25" />
    </Svg>
  );
}

/* ─── Settings (gear) ─── */
export function SettingsIcon(props: IconProps) {
  const p = "set";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 齒輪 — 8 齒 */}
      <path
        d="M12 1.5l1.6 1.4 2.1-.3.9 1.9 2 .7v2.1l1.5 1.5-.9 1.9.6 2-1.5 1.5v2.1l-2 .7-.9 1.9-2.1-.3L12 22.5l-1.6-1.4-2.1.3-.9-1.9-2-.7v-2.1l-1.5-1.5.6-2-.6-1.9L5.4 10V7.9l2-.7.9-1.9 2.1.3L12 1.5Z"
        fill={`url(#${p}-d)`}
      />
      {/* 中央亮圓 */}
      <circle cx="12" cy="12" r="5" fill={`url(#${p}-l)`} />
      {/* 中央小 dot */}
      <circle cx="12" cy="12" r="1.8" fill={DARK_1} />
    </Svg>
  );
}

/* ─── User ─── */
export function UserIcon(props: IconProps) {
  const p = "usr";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 頭 */}
      <circle cx="12" cy="7.5" r="4.5" fill={`url(#${p}-d)`} />
      {/* 肩膀 */}
      <path
        d="M3 22c0-4.4 4-7.5 9-7.5s9 3.1 9 7.5v.5H3V22Z"
        fill={`url(#${p}-l)`}
      />
      {/* 頭部高光 */}
      <ellipse cx="10" cy="5.8" rx="1.5" ry="1" fill={LIGHT_1} opacity="0.3" />
    </Svg>
  );
}

/* ─── Sun ─── */
export function SunIcon(props: IconProps) {
  const p = "sun";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 光芒 (放射) */}
      <g fill={DARK_1}>
        <rect x="11" y="0.5" width="2" height="3.5" rx="1" />
        <rect x="11" y="20" width="2" height="3.5" rx="1" />
        <rect x="0.5" y="11" width="3.5" height="2" rx="1" />
        <rect x="20" y="11" width="3.5" height="2" rx="1" />
        <rect x="3" y="3" width="2" height="3.5" rx="1" transform="rotate(-45 4 4.75)" />
        <rect x="19" y="3" width="2" height="3.5" rx="1" transform="rotate(45 20 4.75)" />
        <rect x="3" y="17.5" width="2" height="3.5" rx="1" transform="rotate(45 4 19.25)" />
        <rect x="19" y="17.5" width="2" height="3.5" rx="1" transform="rotate(-45 20 19.25)" />
      </g>
      {/* 太陽圓 */}
      <circle cx="12" cy="12" r="5" fill={`url(#${p}-d)`} />
      <circle cx="12" cy="12" r="4" fill={`url(#${p}-l)`} />
    </Svg>
  );
}

/* ─── Moon ─── */
export function MoonIcon(props: IconProps) {
  const p = "moon";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 月亮主體 */}
      <path
        d="M20.5 14.5a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z"
        fill={`url(#${p}-d)`}
      />
      {/* 內部亮弧 (高光) */}
      <path
        d="M18 14.5a7 7 0 0 1-8.5-8.5A7 7 0 1 0 18 14.5Z"
        fill={`url(#${p}-l)`}
        opacity="0.4"
      />
      {/* 兩顆星點 */}
      <circle cx="19" cy="5" r="0.9" fill={LIGHT_1} />
      <circle cx="16" cy="3" r="0.6" fill={LIGHT_1} opacity="0.7" />
    </Svg>
  );
}

/* ─── LogOut ─── */
export function LogOutIcon(props: IconProps) {
  const p = "out";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 門框（亮） */}
      <path
        d="M3 5a3 3 0 0 1 3-3h5v3H6v14h5v3H6a3 3 0 0 1-3-3V5Z"
        fill={`url(#${p}-l)`}
      />
      {/* 右側箭頭/門把（深色） */}
      <path
        d="M15.3 7.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l2.3-2.3H9a1 1 0 1 1 0-2h8.6l-2.3-2.3a1 1 0 0 1 0-1.4Z"
        fill={`url(#${p}-d)`}
      />
    </Svg>
  );
}

/* ─── Users (multi-person) ─── */
export function UsersIcon(props: IconProps) {
  const p = "usrs";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 後方人 (暗) */}
      <circle cx="17" cy="8" r="3" fill={`url(#${p}-d)`} opacity="0.75" />
      <path
        d="M11 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5v2H11v-2Z"
        fill={`url(#${p}-d)`}
        opacity="0.75"
      />
      {/* 前方主要人 (亮) */}
      <circle cx="9" cy="9" r="4" fill={`url(#${p}-d)`} />
      <path
        d="M1 21c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5v1.5H1V21Z"
        fill={`url(#${p}-l)`}
      />
    </Svg>
  );
}

/* ─── Calculator ─── */
export function CalculatorIcon(props: IconProps) {
  const p = "calc";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 機身 */}
      <rect x="4" y="2" width="16" height="20" rx="3" fill={`url(#${p}-d)`} />
      {/* 螢幕（亮） */}
      <rect x="6" y="4.5" width="12" height="4" rx="1.5" fill={`url(#${p}-l)`} />
      {/* 鍵 (3x3) */}
      <g fill={LIGHT_1} opacity="0.75">
        <circle cx="8" cy="12" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="16" cy="12" r="1.2" />
        <circle cx="8" cy="15.5" r="1.2" />
        <circle cx="12" cy="15.5" r="1.2" />
        <circle cx="16" cy="15.5" r="1.2" />
        <circle cx="8" cy="19" r="1.2" />
        <circle cx="12" cy="19" r="1.2" />
        <circle cx="16" cy="19" r="1.2" />
      </g>
    </Svg>
  );
}

/* ─── Wallet ─── */
export function WalletIcon(props: IconProps) {
  const p = "wall";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 錢包主體 (暗) */}
      <path
        d="M2 7a4 4 0 0 1 4-4h12a2 2 0 0 1 2 2v2H6a2 2 0 1 0 0 4h14a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Z"
        fill={`url(#${p}-d)`}
      />
      {/* 卡層（亮高光） */}
      <path
        d="M2 11h18a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8Z"
        fill={`url(#${p}-l)`}
      />
      {/* 右方圓點 (磁扣) */}
      <circle cx="17" cy="15" r="1.5" fill={DARK_1} />
    </Svg>
  );
}

/* ─── Download ─── */
export function DownloadIcon(props: IconProps) {
  const p = "dl";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 下方托盤 (亮) */}
      <path
        d="M3 15.5a1.5 1.5 0 1 1 3 0V19h12v-3.5a1.5 1.5 0 1 1 3 0V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.5Z"
        fill={`url(#${p}-l)`}
      />
      {/* 下載箭頭 (暗) */}
      <path
        d="M12 1.5a1.5 1.5 0 0 1 1.5 1.5v8.9l2.4-2.4a1.5 1.5 0 1 1 2.2 2l-5 5a1.5 1.5 0 0 1-2.2 0l-5-5a1.5 1.5 0 1 1 2.2-2l2.4 2.4V3A1.5 1.5 0 0 1 12 1.5Z"
        fill={`url(#${p}-d)`}
      />
    </Svg>
  );
}

/* ─── LayoutDashboard ─── */
export function DashboardIcon(props: IconProps) {
  const p = "dash";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 左大塊（暗） */}
      <rect x="2.5" y="2.5" width="8.5" height="12" rx="2" fill={`url(#${p}-d)`} />
      {/* 右上塊（亮） */}
      <rect x="13" y="2.5" width="8.5" height="7" rx="2" fill={`url(#${p}-l)`} />
      {/* 下方整條（亮） */}
      <rect x="2.5" y="16.5" width="19" height="5" rx="2" fill={`url(#${p}-l)`} />
      {/* 右小深塊 */}
      <rect x="13" y="11.5" width="8.5" height="3.5" rx="1.5" fill={`url(#${p}-d)`} opacity="0.8" />
    </Svg>
  );
}

/* ─── UserPlus ─── */
export function UserPlusIcon(props: IconProps) {
  const p = "up";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 人頭 */}
      <circle cx="9" cy="8" r="4" fill={`url(#${p}-d)`} />
      {/* 肩膀 */}
      <path
        d="M1 20c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5v1.5H1V20Z"
        fill={`url(#${p}-l)`}
      />
      {/* 加號 (右上，亮框) */}
      <circle cx="18.5" cy="7" r="4.5" fill={`url(#${p}-l)`} />
      <path
        d="M18.5 4.5v5M16 7h5"
        stroke={DARK_1}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ─── CalendarPlus ─── */
export function CalendarPlusIcon(props: IconProps) {
  const p = "calp";
  return (
    <Svg {...props}>
      <Defs idPrefix={p} />
      {/* 行事曆上方深色 */}
      <path
        d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4H3V6Z"
        fill={`url(#${p}-d)`}
      />
      {/* 行事曆下方亮色 */}
      <path
        d="M3 10h18v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8Z"
        fill={`url(#${p}-l)`}
      />
      {/* 綁環 */}
      <rect x="6.5" y="1.5" width="2" height="4.5" rx="1" fill={`url(#${p}-d)`} />
      <rect x="15.5" y="1.5" width="2" height="4.5" rx="1" fill={`url(#${p}-d)`} />
      {/* 加號（中央） */}
      <path
        d="M12 12v6M9 15h6"
        stroke={DARK_1}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}
