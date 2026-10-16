"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useOutsideClick } from "@/lib/hooks/use-outside-click";

/**
 * Popover — 錨點旁絕對定位的小浮窗（如下拉編輯框）
 *
 * 用法：
 *   const [open, setOpen] = useState(false);
 *   <Popover
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     trigger={<button>開啟</button>}
 *   >
 *     ...浮窗內容
 *   </Popover>
 *
 * 設計決策：
 * - 預設 anchor 下方對齊左邊（下拉編輯 pattern）
 * - 自動 outside-click 關閉
 * - Esc 關閉
 * - 不處理 collision detection（Radix 才會做；需要時再升級）
 */

type PopoverAlign = "start" | "center" | "end";

export function Popover({
  open,
  onClose,
  trigger,
  children,
  align = "start",
  className,
  width = "15rem",
}: {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: PopoverAlign;
  className?: string;
  /** CSS width value (e.g. "15rem", "100%") */
  width?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(containerRef, onClose, open);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger}
      {open && (
        <div
          style={{ width }}
          className={cn(
            "glass-strong absolute top-full z-30 mt-1 rounded-2xl p-3 shadow-xl",
            alignClass,
            className,
          )}
          role="dialog"
        >
          {children}
        </div>
      )}
    </div>
  );
}
