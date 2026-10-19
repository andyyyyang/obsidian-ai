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
  const panelRef = React.useRef<HTMLDivElement>(null);
  useOutsideClick(containerRef, onClose, open);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 動態把 popover 的最大高度綁到「觸發點下方還剩的視窗空間」—
  // 選項列表太長時 (e.g. 員工 ⋯ 選單) 就能在 popover 內部滾動，
  // 而不會往下滑出螢幕變成卡住點不到。觸發點下方不夠的話，
  // flip 到觸發點上方展開。
  const [style, setStyle] = React.useState<React.CSSProperties>({ width });
  const [flipUp, setFlipUp] = React.useState(false);

  React.useEffect(() => {
    if (!open || !containerRef.current) return;

    const MARGIN = 16;
    const MIN = 180;

    function update() {
      const rect = containerRef.current!.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - MARGIN;
      const above = rect.top - MARGIN;
      const useUp = below < MIN && above > below;
      const avail = Math.max(MIN, useUp ? above : below);
      setFlipUp(useUp);
      setStyle({ width, maxHeight: `${avail}px` });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, width]);

  const alignClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  const verticalClass = flipUp ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger}
      {open && (
        <div
          ref={panelRef}
          style={style}
          className={cn(
            "glass-strong absolute z-30 flex flex-col overflow-y-auto overscroll-contain rounded-2xl p-3 shadow-xl",
            verticalClass,
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
