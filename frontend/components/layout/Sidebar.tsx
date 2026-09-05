import Link from "next/link";
import { OrgSwitcher } from "./OrgSwitcher";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Your projects" },
  { href: "/news", label: "News" },
  { href: "/community", label: "Community" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col gap-6 border-r border-neutral-800 bg-neutral-950 p-4">
      <OrgSwitcher />

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* TODO Fase 1: reemplazar por sesion real (avatar + username de Supabase Auth). */}
      <div className="flex items-center gap-2 border-t border-neutral-800 pt-4 text-sm text-neutral-400">
        <div className="h-8 w-8 rounded-full bg-neutral-700" />
        <span>username</span>
      </div>
    </aside>
  );
}
