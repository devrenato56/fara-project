"use client";

import Link from "next/link";
import {
  FolderGit2,
  CheckCircle2,
  Bot,
  Users,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  Swords,
  Code2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
  const { user, projects } = useApp();

  const stats = [
    {
      label: "Proyectos",
      value: projects.length,
      icon: FolderGit2,
      desc: "repos vinculados",
      accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "Problemas resueltos",
      value: 48,
      icon: CheckCircle2,
      desc: "ejercicios validados",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Victorias vs IA",
      value: 23,
      icon: Bot,
      desc: "duelos ganados",
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Victorias vs Humanos",
      value: 7,
      icon: Users,
      desc: "enfrentamientos en vivo",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Resolviste Autenticación JWT en Go (Code Mode)",
      time: "Hace 2h",
      type: "code",
      icon: CheckCircle2,
      accent: "text-emerald-400",
    },
    {
      id: 2,
      title: "Ganaste a la IA en Concurrencia con Goroutines",
      time: "Hace 1d",
      type: "ai_win",
      icon: Bot,
      accent: "text-purple-400",
    },
    {
      id: 3,
      title: "Perdiste contra Alex en Sistema de Colas",
      time: "Hace 2d",
      type: "human_loss",
      icon: Swords,
      accent: "text-rose-400",
    },
    {
      id: 4,
      title: "Proyecto API de Tareas actualizado con 3 nuevos problemas",
      time: "Hace 3d",
      type: "project",
      icon: FolderGit2,
      accent: "text-sky-400",
    },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-6xl">
      {/* Header de bienvenida y racha */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Aquí tienes un resumen de tu actividad y progreso tecnológico.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="text-xs font-medium text-amber-300/80">
              Racha de aprendizaje
            </div>
            <div className="text-base font-bold text-amber-200">
              ¡Llevas una racha de {user.streakDays} días!
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 4 Métricas Clave */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 lg:p-5 transition-colors hover:border-slate-700/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] lg:text-xs font-semibold text-slate-500">
                  {stat.label}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${stat.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 lg:mt-4">
                <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
                  {stat.value}
                </span>
                <span className="ml-1.5 text-[11px] text-slate-500">{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secciones Principales: Actividad Reciente y Continuar Practicando */}
      <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: Actividad Reciente (2 cols) */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 lg:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-200">
              Actividad reciente
            </h2>
            <span className="text-xs text-slate-500">Últimos 7 días</span>
          </div>

          <div className="space-y-3">
            {recentActivity.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-800/30 p-3 lg:p-3.5 transition-colors hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 ${act.accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 truncate">
                      {act.title}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 shrink-0 ml-3">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Continuar practicando */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-800 p-5 lg:p-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/50 px-3 py-1 text-xs font-semibold text-slate-300">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                Continuar practicando
              </div>

              <h3 className="mt-4 text-lg lg:text-xl font-bold text-slate-100">API REST con Go</h3>
              <p className="mt-1 text-xs text-slate-400">
                Mejorar tu manejo de handlers, context y middlewares HTTP.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-700/60 border border-slate-600/40 px-2 py-1 text-[11px] font-mono text-slate-300">
                  Go 1.22
                </span>
                <span className="rounded-md bg-slate-700/60 border border-slate-600/40 px-2 py-1 text-[11px] font-mono text-slate-300">
                  Gin
                </span>
                <span className="rounded-md bg-slate-700/60 border border-slate-600/40 px-2 py-1 text-[11px] font-mono text-slate-300">
                  JWT
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/problems/prob-1/code"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 cursor-pointer"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de Tecnologías Aprendidas este mes */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 lg:p-5">
            <h3 className="text-sm font-bold text-slate-200">
              Tecnologías aprendidas este mes
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Go (Golang)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Docker
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                PostgreSQL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
