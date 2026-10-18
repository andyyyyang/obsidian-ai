"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Pencil, Power, KeyRound, ClipboardList, Mail } from "lucide-react";
import { toast } from "sonner";
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CalendarPlusIcon,
  WalletIcon,
  UsersIcon,
} from "@/components/icons/glass-icons";
import { AdjustBalancePopover } from "./adjust-balance-popover";
import { ResetPasswordDialog } from "./reset-password-dialog";
import type { SubordinateRow } from "./types";

export function RowActions({
  row,
  isAdmin,
  onPatch,
}: {
  row: SubordinateRow;
  isAdmin: boolean;
  onPatch: (patch: Partial<SubordinateRow>) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [resetDialog, setResetDialog] = useState<{ open: boolean; password?: string }>({ open: false });
  const [pendingAction, setPendingAction] = useState(false);

  async function toggleActive() {
    const next = !row.active;
    if (!confirm(next ? `啟用 ${row.name}？` : `停用 ${row.name}？\n（請假紀錄不會刪除，但無法再登入）`)) return;
    setPendingAction(true);
    try {
      const res = await fetch(`/api/admin/users/${row.id}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "操作失敗");
        return;
      }
      toast.success(next ? "已啟用" : "已停用");
      onPatch({ active: next });
      setMenuOpen(false);
    } finally {
      setPendingAction(false);
    }
  }

  async function resetPassword() {
    if (!confirm(`產生 ${row.name} 的新密碼？\n舊密碼會立刻失效，請把新密碼親自轉達給員工。`)) return;
    setPendingAction(true);
    try {
      const res = await fetch(`/api/admin/users/${row.id}/reset-password`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "重設失敗");
        return;
      }
      setResetDialog({ open: true, password: data.password });
      setMenuOpen(false);
    } finally {
      setPendingAction(false);
    }
  }

  return (
    <>
      <Popover
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        align="end"
        width="13rem"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((o) => !o)}
            icon={<MoreHorizontal className="h-4 w-4" />}
            aria-label="操作選單"
          />
        }
      >
        <div className="space-y-0.5">
          <MenuItem
            icon={<CalendarPlusIcon className="h-4 w-4" />}
            label="補登請假"
            onClick={() => {
              router.push(`/manage/backfill?userId=${row.id}`);
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<ClipboardList className="h-4 w-4 text-ios-blue" />}
            label={row.pendingCount > 0 ? `待審申請（${row.pendingCount}）` : "待審申請"}
            onClick={() => {
              router.push("/approvals");
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<CalendarIcon className="h-4 w-4" />}
            label="在月曆上查看"
            onClick={() => {
              router.push(`/calendar?focus=${row.id}`);
              setMenuOpen(false);
            }}
          />
          <MenuItem
            icon={<Mail className="h-4 w-4 text-slate-400" />}
            label="複製 Email"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(row.email);
                toast.success("已複製 Email");
              } catch {
                toast.error("複製失敗");
              }
              setMenuOpen(false);
            }}
          />

          {isAdmin && (
            <>
              <div className="my-1 border-t border-white/40 dark:border-slate-700/40" />
              <MenuItem
                icon={<Pencil className="h-4 w-4 text-ios-indigo" />}
                label="編輯資料"
                onClick={() => {
                  router.push(`/admin/users/${row.id}`);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={<WalletIcon className="h-4 w-4" />}
                label="調整特休餘額"
                disabled={!row.balance.annualLeaveEnabled || !row.balance.yearStart}
                onClick={() => {
                  setMenuOpen(false);
                  setAdjustOpen(true);
                }}
              />
              <MenuItem
                icon={<UsersIcon className="h-4 w-4" />}
                label="員工頁完整檢視"
                onClick={() => {
                  router.push(`/admin/users/${row.id}`);
                  setMenuOpen(false);
                }}
              />
              <MenuItem
                icon={<KeyRound className="h-4 w-4 text-amber-500" />}
                label="重設密碼"
                onClick={resetPassword}
                disabled={pendingAction}
              />
              <MenuItem
                icon={<Power className={`h-4 w-4 ${row.active ? "text-rose-500" : "text-emerald-500"}`} />}
                label={row.active ? "停用員工" : "啟用員工"}
                onClick={toggleActive}
                disabled={pendingAction}
              />
            </>
          )}
        </div>
      </Popover>

      {adjustOpen && (
        <AdjustBalancePopover
          row={row}
          onClose={() => setAdjustOpen(false)}
          onAdjusted={(delta) => {
            onPatch({
              balance: {
                ...row.balance,
                adjustments: row.balance.adjustments + delta,
                remaining: row.balance.remaining + delta,
              },
            });
            router.refresh();
          }}
        />
      )}

      {resetDialog.open && resetDialog.password && (
        <ResetPasswordDialog
          name={row.name}
          password={resetDialog.password}
          onClose={() => setResetDialog({ open: false })}
        />
      )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800/50"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  );
}
