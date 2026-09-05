"use client";

import React from "react";
import { Check, Sparkles, Zap, Shield, HelpCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BillingPage() {
  const { user, setPlan } = useApp();

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Billing
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Gestiona tu suscripción y facturación. Elige el plan que se adapte a tu ritmo de aprendizaje.
        </p>
      </div>

      {/* Grid de 2 Planes: NPC vs Giga Chad */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto w-full">
        {/* Plan NPC */}
        <div
          className={`flex flex-col justify-between rounded-3xl border-2 p-8 transition-all shadow-sm ${
            user.plan === "npc"
              ? "border-neutral-900 bg-white dark:border-neutral-100 dark:bg-neutral-900"
              : "border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-950"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                NPC
              </h3>
              {user.plan === "npc" && (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  Plan actual
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-neutral-500">
              Perfecto para empezar a explorar y practicar sobre repositorios básicos.
            </p>

            <div className="my-6">
              <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                Gratis
              </span>
              <span className="text-xs text-neutral-400 ml-2">para siempre</span>
            </div>

            <ul className="space-y-3 border-t border-neutral-100 pt-6 text-xs text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
              <li className="flex items-center justify-between">
                <span>Problemas generados al mes</span>
                <span className="font-semibold">10</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Modo Fight (vs IA)</span>
                <span className="font-semibold text-neutral-500">3 duelos / semana</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Duelos vs Humanos (enlaces)</span>
                <span className="font-semibold">Ilimitados</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Historial de soluciones</span>
                <span className="font-semibold text-neutral-500">Últimos 14 días</span>
              </li>
              <li className="flex items-center justify-between opacity-50">
                <span>Acceso prioritario a nuevos stacks</span>
                <span>—</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setPlan("npc")}
            disabled={user.plan === "npc"}
            className="mt-8 w-full rounded-2xl border border-neutral-300 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-default disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {user.plan === "npc" ? "Plan actual" : "Cambiar a NPC"}
          </button>
        </div>

        {/* Plan Giga Chad */}
        <div
          className={`relative flex flex-col justify-between rounded-3xl border-2 p-8 transition-all shadow-xl ${
            user.plan === "giga_chad"
              ? "border-purple-600 bg-neutral-900 text-white shadow-purple-500/10"
              : "border-purple-300 bg-neutral-900 text-white dark:border-purple-800"
          }`}
        >
          <div className="absolute -top-3.5 right-6 rounded-full bg-purple-600 px-3.5 py-1 text-xs font-black tracking-wide text-white uppercase shadow-sm">
            Recomendado ⭐
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-xl font-black text-white">Giga Chad</h3>
              </div>
              {user.plan === "giga_chad" && (
                <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300">
                  Plan actual
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-neutral-400">
              Para quienes quieren desbloquear su máximo potencial y acelerar su adaptabilidad.
            </p>

            <div className="my-6">
              <span className="text-4xl font-extrabold text-white">$9.99</span>
              <span className="text-xs text-neutral-400 ml-2">/ mes</span>
            </div>

            <ul className="space-y-3 border-t border-neutral-800 pt-6 text-xs text-neutral-300">
              <li className="flex items-center justify-between">
                <span>Problemas generados al mes</span>
                <span className="font-bold text-emerald-400">Ilimitados</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Modo Fight (vs IA)</span>
                <span className="font-bold text-emerald-400">Ilimitado (niveles calibrados)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Duelos vs Humanos (enlaces)</span>
                <span className="font-bold text-emerald-400">Ilimitados</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Historial y portafolio de habilidades</span>
                <span className="font-bold text-emerald-400">Permanente</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Acceso prioritario a nuevos frameworks</span>
                <Check className="h-4 w-4 text-purple-400" />
              </li>
            </ul>
          </div>

          <button
            onClick={() => setPlan("giga_chad")}
            disabled={user.plan === "giga_chad"}
            className="mt-8 w-full rounded-2xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-purple-700 disabled:cursor-default disabled:opacity-60"
          >
            {user.plan === "giga_chad" ? "Plan activo" : "Elegir plan Giga Chad"}
          </button>
        </div>
      </div>
    </div>
  );
}
