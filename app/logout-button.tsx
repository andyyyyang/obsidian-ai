"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { LogOutIcon } from "@/components/icons/glass-icons";

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
    <SubmitButton
      type="button"
      variant="ghost"
      size="md"
      pending={pending}
      loadingText="登出中"
      icon={<LogOutIcon className="h-4 w-4" />}
      onClick={handleLogout}
    >
      <span className="hidden sm:inline">登出</span>
    </SubmitButton>
  );
}
