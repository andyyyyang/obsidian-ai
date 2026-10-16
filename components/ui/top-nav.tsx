import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * TopNav — 抽象的頂部 sticky 導覽列
 *
 * 統一 admin / manage 兩個 layout header 的結構：
 *   brand（icon + 標題，可點） + nav（NavLink 列表） + flex-1 + ThemeToggle + 返回主站
 *
 * 設計：
 * - brand 文字手機隱藏（只剩 icon），省空間
 * - nav 可自由 compose（接 NavLink children）
 * - 預設右側有 ThemeToggle + 返回主站；可用 showBackHome / showThemeToggle 關閉
 */

export function TopNav({
  brandIcon,
  brandLabel,
  brandHref,
  children,
  showBackHome = true,
  showThemeToggle = true,
  backHref = "/",
  backLabel = "返回主站",
}: {
  brandIcon: React.ReactNode;
  brandLabel: string;
  brandHref: string;
  /** NavLink children */
  children?: React.ReactNode;
  showBackHome?: boolean;
  showThemeToggle?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link
          href={brandHref}
          className="flex items-center gap-1.5 whitespace-nowrap text-base font-bold text-gradient"
        >
          <span className="flex-shrink-0">{brandIcon}</span>
          <span className="hidden sm:inline">{brandLabel}</span>
        </Link>
        {children && (
          <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
            {children}
          </nav>
        )}
        {!children && <div className="flex-1" />}
        {showThemeToggle && <ThemeToggle />}
        {showBackHome && (
          <Link
            href={backHref}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-2xl px-2 text-sm text-slate-500 transition-colors",
              "hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100 sm:px-3",
            )}
            title={backLabel}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
