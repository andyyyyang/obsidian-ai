import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, CalendarCheck, ClipboardList, Settings, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "MANAGER") redirect("/");

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-base font-bold text-gradient">
            <Settings className="h-5 w-5 text-amber-600" />
            店長後台
          </Link>
          <nav className="ml-2 flex flex-wrap gap-1 text-sm">
            <NavLink href="/admin/employees" icon={<Users className="h-4 w-4" />}>
              員工
            </NavLink>
            <NavLink href="/admin/restaurants" icon={<Building2 className="h-4 w-4" />}>
              分店
            </NavLink>
            <NavLink href="/admin/attendance" icon={<ClipboardList className="h-4 w-4" />}>
              出勤總覽
            </NavLink>
            <NavLink href="/admin/shifts" icon={<CalendarCheck className="h-4 w-4" />}>
              班表
            </NavLink>
          </nav>
          <div className="flex-1" />
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            回餐廳
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
      className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-slate-600 transition-all hover:bg-white/70 hover:text-slate-900"
    >
      {icon}
      {children}
    </Link>
  );
}
