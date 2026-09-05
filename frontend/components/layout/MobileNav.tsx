"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Swords,
  Users,
  Settings,
} from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/community", label: "Arena", icon: Swords },
  { href: "/community", label: "Community", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-800/60 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 min-w-[56px] min-h-[44px] transition-colors ${
                isActive
                  ? "text-emerald-400"
                  : "text-slate-500 active:text-slate-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]" : ""}`} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute -top-0 h-0.5 w-6 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
