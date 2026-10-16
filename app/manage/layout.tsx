import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { TopNav } from "@/components/ui/top-nav";
import { NavLink } from "@/components/ui/nav-link";
import { BriefcaseIcon, CalendarPlusIcon, UserPlusIcon } from "@/components/icons/glass-icons";

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "MANAGER" && session.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen">
      <TopNav
        brandIcon={<BriefcaseIcon className="h-5 w-5" />}
        brandLabel="管理工具"
        brandHref="/manage"
      >
        <NavLink href="/manage/users/new" icon={<UserPlusIcon className="h-4 w-4" />} activeMatch="prefix">
          新增員工
        </NavLink>
        <NavLink href="/manage/backfill" icon={<CalendarPlusIcon className="h-4 w-4" />} activeMatch="prefix">
          補登請假
        </NavLink>
      </TopNav>
      {children}
    </div>
  );
}
