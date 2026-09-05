"use client";

import React from "react";
import { Bell, Flame, Sparkles, Shield, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { usePathname } from "next/navigation";

export function Header() {
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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-200/80 bg-white/75 px-6 backdrop-blur-xl transition-all dark:border-neutral-800/80 dark:bg-neutral-950/75">
      {/* Breadcrumb contextual de la sección */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1 font-bold text-neutral-900 dark:text-white">
          <Shield className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
          {currentOrg?.name || "FARA"}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-neutral-700 dark:text-neutral-300 font-medium">
          {getSectionTitle()}
        </span>
      </div>

      {/* Acciones del Header */}
      <div className="flex items-center gap-3.5">
        {/* Switch de demostración de Plan (Pro/Free) */}
        <button
          onClick={() => setPlan(user.plan === "giga_chad" ? "npc" : "giga_chad")}
          className={`group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
            user.plan === "giga_chad"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/20 hover:shadow-md hover:scale-102"
              : "border border-neutral-200 bg-neutral-100/80 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
          title="Alternar Plan (Demostración)"
        >
          <Sparkles className={`h-3.5 w-3.5 ${user.plan === "giga_chad" ? "text-amber-300 animate-pulse" : "text-neutral-400"}`} />
          <span>{user.plan === "giga_chad" ? "Plan PRO ($9.99)" : "Plan FREE ($0)"}</span>
        </button>

        {/* Indicador de Racha */}
        <div className="flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-500/10 px-3.5 py-1.5 text-xs font-black text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
          <span>Racha: {user.streakDays}d</span>
        </div>

        {/* Notificaciones */}
        <button
          className="relative rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          title="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
        </button>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2.5 border-l border-neutral-200/80 pl-3.5 dark:border-neutral-800/80">
          <div className="relative flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-800"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white shadow-xs dark:bg-white dark:text-neutral-900">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
          </div>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {user.username}
          </span>
        </div>
      </div>
    </header>
  );
}
