"use client";
import { type RefObject, useEffect } from "react";

/**
 * 點擊元素外部時觸發 callback。
 * 常用於 popover / dropdown 的「點外面關閉」。
 *
 * @param ref 容器元素的 ref
 * @param onOutsideClick 外部點擊時執行
 * @param enabled 控制開關（例如只有打開時才監聽）
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return;
    function handler(e: MouseEvent) {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) {
        onOutsideClick();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutsideClick, enabled]);
}
