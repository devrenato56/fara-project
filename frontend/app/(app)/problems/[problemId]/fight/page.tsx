"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Bot,
  Users,
  Swords,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiClient } from "@/lib/api-client";
import { mapProblem } from "@/lib/mappers";
import { technologyToRuntime } from "@/lib/runtimes";

const STACK_ICONS: Record<string, string> = {
  Go: "⚡",
  Docker: "🐳",
  PostgreSQL: "🐘",
  Redis: "🔴",
  Python: "🐍",
  JavaScript: "🟨",
  TypeScript: "🟦",
  Rust: "🦀",
};

const DIFFICULTY_LEVELS = [
  { id: "easy", label: "Aprendiz", hint: "La IA va lenta y comete más errores visibles" },
  { id: "medium", label: "Intermedio", hint: "Ritmo constante, errores puntuales" },
  { id: "hard", label: "Experto", hint: "La IA va rápida y casi no duda" },
] as const;

export default function FightSetupPage() {
  const params = useParams();
  const router = useRouter();
  const problemId = (params?.problemId as string) || "prob-3";
  const { getProblem, getProject, user } = useApp();

  const [fetchedProblem, setFetchedProblem] = useState<ReturnType<typeof mapProblem> | null>(null);
  useEffect(() => {
    apiClient
      .get<any>(`/problems/${problemId}`)
      .then((data) => setFetchedProblem(mapProblem(data)))
      .catch(() => {});
  }, [problemId]);

  const problem = fetchedProblem ||
    getProblem(problemId) || {
      id: problemId,
      projectId: "proj-1",
      title: "Cargando problema...",
      description: "",
      adaptableTo: [] as string[],
    };

  const project = getProject(problem.projectId) || {
    id: problem.projectId,
    name: "Proyecto",
  };

  const battleStacks = problem.adaptableTo?.length ? problem.adaptableTo : ["Go"];

  const [opponentType, setOpponentType] = useState<"ai" | "human">("ai");
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stack = selectedStack ?? battleStacks[0];

  const handleStartFight = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const match = await apiClient.post<any>("/matches", {
        problem_id: problem.id,
        opponent_type: opponentType,
        technology: stack,
        level,
      });

      const lang = technologyToRuntime(stack);
      if (opponentType === "ai") {
        router.push(`/match/${match.id}/arena?opponent=ai&problemId=${problem.id}&lang=${lang}`);
      } else {
        router.push(`/match/${match.id}/waiting-room?problemId=${problem.id}&lang=${lang}`);
      }
    } catch {
      setError("No se pudo iniciar el duelo. Intenta de nuevo.");
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <Link href="/projects" className="hover:text-neutral-900 dark:hover:text-white">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-neutral-900 dark:hover:text-white"
        >
          {project.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-neutral-900 dark:text-white">Fight Setup</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          <Swords className="h-3.5 w-3.5" />
          Modo Fight en Tiempo Real
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Elige tu oponente
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Selecciona contra quién quieres competir para resolver <strong>{problem.title}</strong>
        </p>
      </div>

      {/* Selector de Oponente: IA vs Humano */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Opción IA */}
        <div
          onClick={() => setOpponentType("ai")}
          className={`cursor-pointer relative flex flex-col justify-between rounded-3xl border-2 p-6 transition-all shadow-sm ${
            opponentType === "ai"
              ? "border-neutral-900 bg-neutral-50/50 dark:border-white dark:bg-neutral-900"
              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950"
          }`}
        >
          {user.plan === "npc" && (
            <div className="absolute top-4 right-4 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-700">
              Giga Chad
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Bot className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">
              Inteligencia Artificial
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed max-w-xs">
              Te enfrentarás a nuestra IA en tiempo real. Escribe soluciones con errores calibrados y correcciones en vivo.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                opponentType === "ai" ? "text-neutral-900 dark:text-white" : "text-neutral-400"
              }`}
            >
              {opponentType === "ai" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              <span>{opponentType === "ai" ? "Seleccionado" : "Elegir IA"}</span>
            </div>
          </div>
        </div>

        {/* Opción Humano */}
        <div
          onClick={() => setOpponentType("human")}
          className={`cursor-pointer flex flex-col justify-between rounded-3xl border-2 p-6 transition-all shadow-sm ${
            opponentType === "human"
              ? "border-neutral-900 bg-neutral-50/50 dark:border-white dark:bg-neutral-900"
              : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Users className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">
              Desarrollador Humano
            </h3>
            <p className="mt-1 text-xs text-neutral-500 leading-relaxed max-w-xs">
              Desafía a un compañero o invita a otro desarrollador mediante un enlace de invitación compartida.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                opponentType === "human" ? "text-neutral-900 dark:text-white" : "text-neutral-400"
              }`}
            >
              {opponentType === "human" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              <span>{opponentType === "human" ? "Seleccionado" : "Elegir Humano"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de Battle Stack */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
          Choose the battle stack
        </h3>
        <p className="mt-0.5 text-xs text-neutral-500">
          Selecciona el runtime y framework con el que se medirá la solución:
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {battleStacks.map((name) => {
            const isSelected = stack === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedStack(name)}
                className={`flex items-center gap-2.5 rounded-2xl border-2 px-5 py-3 text-sm font-bold transition ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-xs dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                }`}
              >
                <span className="text-lg">{STACK_ICONS[name] ?? "🧩"}</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nivel de la IA (solo aplica al duelo contra la IA) */}
      {opponentType === "ai" && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
            Nivel de la IA
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Calibra el ritmo y la cantidad de errores deliberados que va a cometer:
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DIFFICULTY_LEVELS.map((option) => {
              const isSelected = level === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLevel(option.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800"
                      : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950"
                  }`}
                >
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                    {option.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botón de Iniciar */}
      <div className="flex flex-col items-center gap-3">
        {error && (
          <div className="w-full max-w-sm rounded-xl bg-rose-50 py-2 text-center text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}
        <button
          onClick={handleStartFight}
          disabled={isStarting}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-4 text-base font-bold text-white shadow-lg transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Swords className="h-5 w-5 text-amber-400" />
          {isStarting ? "Preparando arena..." : "Start fight"}
        </button>

        <p className="text-xs text-neutral-400">
          Timer oficial de 5:00 minutos por duelo.
        </p>
      </div>
    </div>
  );
}
