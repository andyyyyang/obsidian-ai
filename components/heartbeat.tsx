"use client";

import { useEffect } from "react";

/**
 * 客戶端心跳 — 每 30 秒 ping 一次，讓 server 標記「線上中」
 * 也順便在頁面 visible 時立即 ping
 */
export function Heartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/me/ping", { method: "POST", keepalive: true }).catch(() => {});
    };
    ping();
    const id = setInterval(ping, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return null;
}
