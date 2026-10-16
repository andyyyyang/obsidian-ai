import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 全站統一按鈕元件
 *
 * 設計決策：
 * - variant 對應 globals.css 既有的 .btn-* class，避免重複定義樣式
 * - size 控制高度與 padding，純 icon 用 size="icon"
 * - loading 自動顯示 Loader2 + 禁用（與既有 pattern 一致）
 * - asChild 允許把樣式套到 <Link> 等外部元件（如 Radix Slot，這裡用簡化版）
 */

export type ButtonVariant = "primary" | "ghost" | "danger" | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  success: "btn-success",
};

// size 覆寫 .btn-* 預設的 px-4 py-2 / h-9ish
const sizeClass: Record<ButtonSize, string> = {
  xs: "!px-2.5 !py-1 !text-xs",
  sm: "!px-3 !py-1.5 !text-xs",
  md: "", // 用 .btn-* 預設
  lg: "!px-5 !py-2.5 !text-base",
  icon: "!h-9 !w-9 !min-w-0 !px-0",
  "icon-sm": "!h-8 !w-8 !min-w-0 !px-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  /** 讓按鈕的樣式套到 children 上（供 <Link>、<a> 使用）。children 必須是單一元素。 */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading,
    loadingText,
    icon,
    fullWidth,
    asChild,
    className,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const finalClass = cn(
    variantClass[variant],
    sizeClass[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
      ) : icon ? (
        <span className="inline-flex flex-shrink-0 items-center">{icon}</span>
      ) : null}
      {loading && loadingText ? loadingText : children}
    </>
  );

  if (asChild && React.isValidElement(children)) {
    // 把 className 合併到 children（簡化版 Slot）
    const childProps = (children as React.ReactElement<{ className?: string }>).props;
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(finalClass, childProps.className),
    });
  }

  return (
    <button
      ref={ref}
      type={type}
      className={finalClass}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
});
