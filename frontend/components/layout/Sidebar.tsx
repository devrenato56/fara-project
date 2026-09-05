"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Newspaper,
  Users,
  CreditCard,
  Settings,
  Flame,
  Zap,
} from "lucide-react";
import { OrgSwitcher } from "./OrgSwitcher";
import { useApp } from "@/context/AppContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Your projects", icon: FolderGit2 },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/community", label: "Community", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useApp();

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col gap-6">
        {/* Logo Fara */}
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Fara
            </span>
          </Link>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <Flame className="h-3.5 w-3.5 fill-current text-amber-500" />
            <span>{user.streakDays}d</span>
          </div>
        </div>

        {/* Selector de Organización */}
        <OrgSwitcher />

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-neutral-900 font-semibold text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white dark:text-neutral-900" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer con Perfil de Usuario */}
      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Link
          href="/settings"
          className="flex items-center justify-between rounded-xl p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                {user.username.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user.username}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {user.plan === "giga_chad" ? "Giga Chad ⭐" : "NPC Free"}
              </span>
            </div>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              user.plan === "giga_chad"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {user.plan === "giga_chad" ? "PRO" : "FREE"}
          </span>
        </Link>
      </div>
    </aside>
  );
}
