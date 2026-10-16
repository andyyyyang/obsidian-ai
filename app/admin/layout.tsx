import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { TopNav } from "@/components/ui/top-nav";
import { NavLink } from "@/components/ui/nav-link";
import {
  CalculatorIcon,
  DashboardIcon,
  DownloadIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons/glass-icons";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <TopNav
        brandIcon={<DashboardIcon className="h-5 w-5" />}
        brandLabel="HR 後台"
        brandHref="/admin"
      >
        <NavLink href="/admin/users" icon={<UsersIcon className="h-4 w-4" />} activeMatch="prefix">
          員工
        </NavLink>
        <NavLink href="/admin/balances" icon={<CalculatorIcon className="h-4 w-4" />} activeMatch="prefix">
          餘額調整
        </NavLink>
        <NavLink href="/admin/payouts" icon={<WalletIcon className="h-4 w-4" />} activeMatch="prefix">
          折發結算
        </NavLink>
        <NavLink href="/admin/export" icon={<DownloadIcon className="h-4 w-4" />} activeMatch="prefix">
          匯出
        </NavLink>
      </TopNav>
      {children}
    </div>
  );
}
