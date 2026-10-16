import { redirect } from "next/navigation";
import { Calculator, Download, LayoutDashboard, Users, Wallet } from "lucide-react";
import { getSession } from "@/lib/session";
import { TopNav } from "@/components/ui/top-nav";
import { NavLink } from "@/components/ui/nav-link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <TopNav
        brandIcon={<LayoutDashboard className="h-5 w-5 text-ios-indigo" />}
        brandLabel="HR 後台"
        brandHref="/admin"
      >
        <NavLink href="/admin/users" icon={<Users className="h-4 w-4" />} activeMatch="prefix">
          員工
        </NavLink>
        <NavLink href="/admin/balances" icon={<Calculator className="h-4 w-4" />} activeMatch="prefix">
          餘額調整
        </NavLink>
        <NavLink href="/admin/payouts" icon={<Wallet className="h-4 w-4" />} activeMatch="prefix">
          折發結算
        </NavLink>
        <NavLink href="/admin/export" icon={<Download className="h-4 w-4" />} activeMatch="prefix">
          匯出
        </NavLink>
      </TopNav>
      {children}
    </div>
  );
}
