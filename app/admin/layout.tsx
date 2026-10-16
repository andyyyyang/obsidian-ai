import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calculator, Download, LayoutDashboard, Users, Wallet } from "lucide-react";
import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 whitespace-nowrap text-base font-bold text-gradient"
          >
            <LayoutDashboard className="icon-lg text-ios-indigo" />
            <span className="hidden sm:inline">HR 後台</span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
            <NavLink href="/admin/users" icon={<Users className="icon-md" />}>
              員工
            </NavLink>
            <NavLink href="/admin/balances" icon={<Calculator className="icon-md" />}>
              餘額調整
            </NavLink>
            <NavLink href="/admin/payouts" icon={<Wallet className="icon-md" />}>
              折發結算
            </NavLink>
            <NavLink href="/admin/export" icon={<Download className="icon-md" />}>
              匯出
            </NavLink>
          </nav>
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-2xl px-2 text-sm text-slate-500 hover:bg-white/70 hover:text-slate-900 sm:px-3"
            title="返回主站"
          >
            <ArrowLeft className="icon-md" />
            <span className="hidden sm:inline">返回主站</span>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-2xl px-2 text-slate-600 transition-all hover:bg-white/70 hover:text-slate-900 sm:px-3"
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}
