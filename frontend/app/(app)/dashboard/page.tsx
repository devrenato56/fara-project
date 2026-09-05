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
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Problemas resueltos",
      value: 48,
      icon: CheckCircle2,
      desc: "ejercicios validados",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "Victorias vs IA",
      value: 23,
      icon: Bot,
      desc: "duelos ganados",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      label: "Victorias vs Humanos",
      value: 7,
      icon: Users,
      desc: "enfrentamientos en vivo",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "Resolviste Autenticación JWT en Go (Code Mode)",
      time: "Hace 2h",
      type: "code",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      id: 2,
      title: "Ganaste a la IA en Concurrencia con Goroutines",
      time: "Hace 1d",
      type: "ai_win",
      icon: Bot,
      color: "text-purple-500",
    },
    {
      id: 3,
      title: "Perdiste contra Alex en Sistema de Colas",
      time: "Hace 2d",
      type: "human_loss",
      icon: Swords,
      color: "text-rose-500",
    },
    {
      id: 4,
      title: "Proyecto API de Tareas actualizado con 3 nuevos problemas",
      time: "Hace 3d",
      type: "project",
      icon: FolderGit2,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Header de bienvenida y racha */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Aquí tienes un resumen de tu actividad y progreso tecnológico.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="text-xs font-medium text-amber-900 dark:text-amber-300">
              Racha de aprendizaje
            </div>
            <div className="text-base font-extrabold text-amber-950 dark:text-amber-100">
              ¡Llevas una racha de {user.streakDays} días!
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 4 Métricas Clave */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {stat.label}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="ml-2 text-xs text-neutral-400">{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secciones Principales: Actividad Reciente y Continuar Practicando */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: Actividad Reciente (2 cols) */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Actividad reciente
            </h2>
            <span className="text-xs text-neutral-400">Últimos 7 días</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5 transition hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-950/40 dark:hover:bg-neutral-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-neutral-800 ${act.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {act.title}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-neutral-400 shrink-0 ml-3">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Continuar practicando */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm dark:border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-300">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                Continuar practicando
              </div>

              <h3 className="mt-4 text-xl font-bold">API REST con Go</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Mejorar tu manejo de handlers, context y middlewares HTTP.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <span className="rounded-md bg-neutral-800 px-2 py-1 text-[11px] font-mono text-neutral-300">
                  Go 1.22
                </span>
                <span className="rounded-md bg-neutral-800 px-2 py-1 text-[11px] font-mono text-neutral-300">
                  Gin
                </span>
                <span className="rounded-md bg-neutral-800 px-2 py-1 text-[11px] font-mono text-neutral-300">
                  JWT
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/problems/prob-1/code"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-neutral-900 shadow transition hover:bg-neutral-100"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de Tecnologías Aprendidas este mes */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Tecnologías aprendidas este mes
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                Go (Golang)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Docker
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                PostgreSQL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
