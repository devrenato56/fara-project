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
  X,
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();

  const sidebarContent = (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-800/60 bg-slate-950 p-4">
      <div className="flex flex-col gap-6">
        {/* Logo + Close on mobile */}
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-100">
              Fara
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Flame className="h-3.5 w-3.5 fill-current text-amber-500" />
              <span>{user.streakDays}d</span>
            </div>
            {/* Close button only on mobile drawer */}
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Selector de Organización */}
        <OrgSwitcher />

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-emerald-500/10 font-semibold text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-emerald-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer con Perfil de Usuario */}
      <div className="border-t border-slate-800/60 pt-4">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-800/60 min-h-[44px]"
        >
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-700"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 font-bold text-white text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">
                {user.username}
              </span>
              <span className="text-xs text-slate-500">
                {user.plan === "giga_chad" ? "Giga Chad" : "Free plan"}
              </span>
            </div>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              user.plan === "giga_chad"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {user.plan === "giga_chad" ? "PRO" : "FREE"}
          </span>
        </Link>
      </div>
    </aside>
  );

  // Desktop: always visible
  // Mobile: overlay drawer
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative h-full w-64 animate-slide-in-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
