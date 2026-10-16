"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className="btn-ghost h-9 min-w-9 px-2 sm:px-4"
    >
      {pending ? <Loader2 className="icon-md animate-spin" /> : <LogOut className="icon-md" />}
      <span className="hidden sm:inline">{pending ? "登出中" : "登出"}</span>
    </button>
  );
}
