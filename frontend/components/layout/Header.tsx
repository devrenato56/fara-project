"use client";

import React from "react";
import { Bell, Flame, Sparkles, Shield, ChevronRight, Menu } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, setPlan, currentOrg } = useApp();
  const pathname = usePathname();

  const getSectionTitle = () => {
    if (pathname.startsWith("/projects")) return "Projects & Battle Stacks";
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";
    if (pathname.startsWith("/problems") || pathname.startsWith("/match")) return "Fight Arena & Code";
    if (pathname.startsWith("/news")) return "Tech News";
    if (pathname.startsWith("/community")) return "Community & Leaderboard";
    if (pathname.startsWith("/billing")) return "Plan & Subscriptions";
    if (pathname.startsWith("/settings")) return "Settings";
    return "FARA Platform";
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 lg:h-16 w-full items-center justify-between border-b border-slate-800/60 glass px-3 lg:px-6">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-2 lg:gap-3 text-sm min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold tracking-tight text-slate-200 text-xs">
            {currentOrg?.name || "FARA"}
          </span>
        </div>
        <ChevronRight className="hidden sm:block h-3.5 w-3.5 text-slate-600" />
        <span className="font-medium text-slate-400 text-xs lg:text-sm truncate">
          {getSectionTitle()}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Plan toggle — hidden on small screens */}
        <button
          onClick={() => setPlan(user.plan === "giga_chad" ? "npc" : "giga_chad")}
          className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            user.plan === "giga_chad"
              ? "bg-purple-500/15 text-purple-400 border border-purple-500/25 hover:bg-purple-500/20"
              : "border border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300"
          }`}
          title="Toggle plan (demo)"
        >
          <Sparkles className={`h-3 w-3 ${user.plan === "giga_chad" ? "text-purple-400" : "text-slate-500"}`} />
          <span>{user.plan === "giga_chad" ? "PRO" : "FREE"}</span>
        </button>

        {/* Streak — hidden on small screens */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400">
          <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>{user.streakDays}d</span>
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 border-l border-slate-800/60 pl-2 lg:pl-3 cursor-pointer hover:opacity-80 transition-opacity">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden lg:block text-sm font-semibold text-slate-200">
            {user.username}
          </span>
        </div>
      </div>
    </header>
  );
}
