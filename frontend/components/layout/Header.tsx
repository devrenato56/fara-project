"use client";

import React from "react";
import { Bell, Flame, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Header() {
  const { user, setPlan } = useApp();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="flex items-center gap-4">
        {/* Placeholder para breadcrumbs o estado dinámico */}
      </div>

      <div className="flex items-center gap-4">
        {/* Switch de demostración de Plan para el Hackathon */}
        <button
          onClick={() => setPlan(user.plan === "giga_chad" ? "npc" : "giga_chad")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition ${
            user.plan === "giga_chad"
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "border border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          }`}
          title="Alternar plan (Demostración Hackathon)"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Plan: {user.plan === "giga_chad" ? "Giga Chad ($9.99)" : "NPC ($0)"}</span>
        </button>

        {/* Indicador de Racha */}
        <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          <Flame className="h-3.5 w-3.5 fill-current text-amber-500" />
          <span>Racha de {user.streakDays} días</span>
        </div>

        {/* Notificaciones */}
        <button
          className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          title="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 border-l border-neutral-200 pl-4 dark:border-neutral-800">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
              {user.username.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {user.username}
          </span>
        </div>
      </div>
    </header>
  );
}
