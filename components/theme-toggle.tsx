"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/ui/client-only";

function ThemeToggleInner() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "切換淺色" : "切換深色"}
      aria-label="切換顏色模式"
      icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    />
  );
}

export function ThemeToggle() {
  // 用 ClientOnly 包，避免 SSR 時 next-themes 跟 client 不一致
  return (
    <ClientOnly fallback={<div className="h-9 w-9 rounded-2xl bg-white/40" aria-hidden />}>
      <ThemeToggleInner />
    </ClientOnly>
  );
}
