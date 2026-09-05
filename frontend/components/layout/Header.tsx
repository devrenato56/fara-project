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
    <header className="sticky top-0 z-20 flex h-[72px] w-full items-center justify-between border-b border-white/10 bg-white/60 px-6 backdrop-blur-2xl transition-all dark:border-neutral-800/60 dark:bg-neutral-950/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Breadcrumb contextual de la sección */}
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/80 px-3 py-1.5 shadow-sm dark:border-neutral-800/60 dark:bg-neutral-900/80">
          <Shield className="h-4 w-4 text-amber-500 fill-amber-500/20" />
          <span className="font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {currentOrg?.name || "FARA"}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400" />
        <span className="font-semibold text-neutral-600 dark:text-neutral-300">
          {getSectionTitle()}
        </span>
      </div>

      {/* Acciones del Header */}
      <div className="flex items-center gap-4">
        {/* Switch de demostración de Plan (Pro/Free) */}
        <button
          onClick={() => setPlan(user.plan === "giga_chad" ? "npc" : "giga_chad")}
          className={`group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
            user.plan === "giga_chad"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] hover:scale-105"
              : "border border-neutral-200 bg-white/50 text-neutral-700 hover:bg-neutral-100/80 hover:scale-105 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
          title="Alternar Plan (Demostración)"
        >
          <Sparkles className={`h-3.5 w-3.5 transition-all ${user.plan === "giga_chad" ? "text-amber-300 animate-pulse" : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"}`} />
          <span>{user.plan === "giga_chad" ? "Plan PRO ($9.99)" : "Plan FREE ($0)"}</span>
        </button>

        {/* Indicador de Racha */}
        <div className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2 text-xs font-black text-amber-700 shadow-sm dark:border-amber-900/30 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-400">
          <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>Racha: {user.streakDays}d</span>
        </div>

        {/* Notificaciones */}
        <button
          className="relative rounded-full p-2.5 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
          title="Notificaciones"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
        </button>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-3 border-l border-neutral-200/60 pl-4 transition-all hover:opacity-80 dark:border-neutral-800/60 cursor-pointer">
          <div className="relative flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-200/50 shadow-sm transition-all hover:ring-neutral-300 dark:ring-neutral-700 dark:hover:ring-neutral-600"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 text-xs font-bold text-white shadow-md ring-2 ring-neutral-200/50 dark:from-neutral-100 dark:to-neutral-300 dark:text-neutral-900 dark:ring-neutral-800">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm dark:ring-neutral-950" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-neutral-800 dark:text-neutral-100">
            {user.username}
          </span>
        </div>
      </div>
    </header>
  );
}
