"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Dialog — 全螢幕遮罩 + 中央/底部 glass panel
 *
 * 替代原本散落的手刻 overlay（day-sheet / history-popover）。
 * 預設 variant="sheet" 在手機從底部滑出，桌面居中；
 * variant="center" 永遠居中。
 *
 * 用法：
 *   const [open, setOpen] = useState(false);
 *   <Dialog open={open} onClose={() => setOpen(false)}>
 *     <DialogHeader title="標題" subtitle="副標" />
 *     ... content ...
 *   </Dialog>
 */

type DialogVariant = "sheet" | "center";

export function Dialog({
  open,
  onClose,
  variant = "sheet",
  maxWidth = "md",
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  variant?: DialogVariant;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}) {
  // Esc 關閉
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 鎖 body scroll
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const maxWidthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  }[maxWidth];

  const positionClass =
    variant === "sheet"
      ? "items-end justify-center sm:items-center"
      : "items-center justify-center";

  const panelShapeClass =
    variant === "sheet"
      ? "w-full rounded-t-3xl sm:rounded-3xl"
      : "w-full rounded-3xl";

  return (
    <div
      className={cn("fixed inset-0 z-40 flex", positionClass)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
      <div
        className={cn(
          "glass-strong relative z-10 p-6",
          panelShapeClass,
          maxWidthClass,
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/** Dialog 內統一的 header（含關閉按鈕） */
export function DialogHeader({
  title,
  subtitle,
  icon,
  onClose,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>
          )}
        </div>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="關閉"
          icon={<X className="h-3.5 w-3.5" />}
        />
      )}
    </div>
  );
}
