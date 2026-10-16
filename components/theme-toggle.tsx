"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/ui/client-only";
import { MoonIcon, SunIcon } from "@/components/icons/glass-icons";

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
      icon={isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    />
  );
}

export function ThemeToggle() {
  return (
    <ClientOnly fallback={<div className="h-9 w-9 rounded-2xl bg-white/40" aria-hidden />}>
      <ThemeToggleInner />
    </ClientOnly>
  );
}
