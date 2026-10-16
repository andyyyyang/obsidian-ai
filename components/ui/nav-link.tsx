"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * NavLink — 全站統一的導覽連結元件
 *
 * 設計：
 * - RWD：手機只顯示 icon（icon-only 36×36 正方），桌面顯示 icon + 文字
 * - variant="glass"（首頁用）套 .btn-ghost 風格；variant="plain"（layout header 用）用輕量 hover
 * - 自動偵測 active（當前 path 匹配 href 開頭）
 */

type NavLinkVariant = "glass" | "plain";

export function NavLink({
  href,
  icon,
  children,
  variant = "plain",
  activeMatch = "exact",
  className,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: NavLinkVariant;
  /** 'exact' 完全相符才 active；'prefix' pathname 以 href 開頭即 active */
  activeMatch?: "exact" | "prefix";
  className?: string;
}) {
  const pathname = usePathname();
  const active =
    activeMatch === "exact" ? pathname === href : pathname?.startsWith(href);

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-medium transition-all sm:px-3";

  const variantClass =
    variant === "glass"
      ? cn(
          "text-slate-700 dark:text-slate-200",
          active
            ? "bg-white/85 shadow-sm"
            : "bg-white/60 backdrop-blur-md border border-white/60 hover:bg-white/85 dark:bg-slate-800/55 dark:border-white/10 dark:hover:bg-slate-800/80",
        )
      : cn(
          "text-slate-600 dark:text-slate-300",
          active
            ? "bg-white/80 text-slate-900 dark:bg-white/10 dark:text-slate-100"
            : "hover:bg-white/60 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-slate-100",
        );

  return (
    <Link href={href} className={cn(base, variantClass, className)}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span className="hidden sm:inline">{children}</span>}
    </Link>
  );
}
