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

/* SVG-based colored indicators instead of emoji */
const STACK_COLORS: Record<string, string> = {
  Go: "bg-cyan-400",
  Docker: "bg-sky-400",
  PostgreSQL: "bg-indigo-400",
  Redis: "bg-rose-400",
  Python: "bg-amber-400",
  JavaScript: "bg-yellow-400",
  TypeScript: "bg-blue-400",
  Rust: "bg-orange-400",
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
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
  const [orgMembers, setOrgMembers] = useState<{user_id: string, username: string, avatar_url: string | null}[]>([]);
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentOrg } = useApp();

  useEffect(() => {
    if (currentOrg?.id) {
      apiClient.get<any[]>(`/organizations/${currentOrg.id}/members`)
        .then(data => setOrgMembers(data))
        .catch(() => {});
    }
  }, [currentOrg?.id]);

  const stack = selectedStack ?? battleStacks[0];

  const handleStartFight = async () => {
    if (opponentType === "human" && !selectedOpponentId) {
      setError("Debes seleccionar un oponente de tu agrupación.");
      return;
    }
    
    setIsStarting(true);
    setError(null);
    try {
      const payload: any = {
        problem_id: problem.id,
        opponent_type: opponentType,
        technology: stack,
        level,
      };
      
      if (opponentType === "human") {
        payload.opponent_user_id = selectedOpponentId;
      }

      const match = await apiClient.post<any>("/matches", payload);

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
    <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/projects" className="hover:text-slate-300 transition-colors">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-slate-300 transition-colors"
        >
          {project.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-slate-300">Fight Setup</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
          <Swords className="h-3.5 w-3.5" />
          Modo Fight en Tiempo Real
        </div>
        <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
          Elige tu oponente
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecciona contra quién quieres competir para resolver <strong className="text-slate-300">{problem.title}</strong>
        </p>
      </div>

      {/* Selector de Oponente: IA vs Humano */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Opción IA */}
        <button
          type="button"
          onClick={() => setOpponentType("ai")}
          className={`cursor-pointer relative flex flex-col justify-between rounded-2xl border-2 p-5 lg:p-6 transition-all min-h-[44px] ${
            opponentType === "ai"
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
          }`}
        >
          {user.plan === "npc" && (
            <div className="absolute top-3 right-3 rounded-full bg-purple-500/15 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-400">
              Giga Chad
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              opponentType === "ai" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"
            }`}>
              <Bot className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-200">
              Inteligencia Artificial
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xs">
              Te enfrentarás a nuestra IA en tiempo real. Escribe soluciones con errores calibrados y correcciones en vivo.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center border-t border-slate-800/60 pt-3">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                opponentType === "ai" ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {opponentType === "ai" && <CheckCircle2 className="h-4 w-4" />}
              <span>{opponentType === "ai" ? "Seleccionado" : "Elegir IA"}</span>
            </div>
          </div>
        </button>

        {/* Opción Humano */}
        <button
          type="button"
          onClick={() => setOpponentType("human")}
          className={`cursor-pointer flex flex-col justify-between rounded-2xl border-2 p-5 lg:p-6 transition-all min-h-[44px] ${
            opponentType === "human"
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              opponentType === "human" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"
            }`}>
              <Users className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-200">
              Desarrollador Humano
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xs">
              Desafía a un miembro de tu agrupación. Selecciónalo de la lista de tu comunidad.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center border-t border-slate-800/60 pt-3">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                opponentType === "human" ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {opponentType === "human" && <CheckCircle2 className="h-4 w-4" />}
              <span>{opponentType === "human" ? "Seleccionado" : "Elegir Humano"}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Selección de Oponente Humano */}
      {opponentType === "human" && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 lg:p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-400">
            Seleccionar miembro de tu agrupación
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Elige a quién deseas retar de tu comunidad.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {orgMembers.length === 0 ? (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-700 p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-2 text-sm font-semibold text-slate-400">No hay otros miembros en tu agrupación.</p>
                <p className="mt-1 text-xs text-slate-500">Invítalos primero desde la vista del proyecto.</p>
              </div>
            ) : (
              orgMembers.map((member) => {
                const isSelected = selectedOpponentId === member.user_id;
                return (
                  <button
                    key={member.user_id}
                    type="button"
                    onClick={() => setSelectedOpponentId(member.user_id)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer min-h-[44px] ${
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                    }`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-300">{member.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200">
                        {member.username}
                      </div>
                      <div className={`text-xs ${isSelected ? "text-emerald-400" : "text-slate-500"}`}>
                        {isSelected ? "Seleccionado" : "Click para retar"}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selección de Battle Stack */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-slate-400">
          Choose the battle stack
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Selecciona el runtime y framework con el que se medirá la solución:
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {battleStacks.map((name) => {
            const isSelected = stack === name;
            const dotColor = STACK_COLORS[name] ?? "bg-slate-400";
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedStack(name)}
                className={`flex items-center gap-2.5 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? "border-emerald-500/50 bg-emerald-500/5 text-slate-200"
                    : "border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <span className={`h-3 w-3 rounded-full ${dotColor}`} />
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nivel de la IA */}
      {opponentType === "ai" && (
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 lg:p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-400">
            Nivel de la IA
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
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
                  className={`rounded-2xl border-2 p-4 text-left transition-all cursor-pointer min-h-[44px] ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                  }`}
                >
                  <div className={`text-sm font-bold ${isSelected ? "text-emerald-400" : "text-slate-300"}`}>
                    {option.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
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
          <div className="w-full max-w-sm rounded-xl bg-rose-500/10 border border-rose-500/20 py-2.5 text-center text-sm font-semibold text-rose-400">
            {error}
          </div>
        )}
        <button
          onClick={handleStartFight}
          disabled={isStarting}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 disabled:opacity-50 cursor-pointer"
        >
          <Swords className="h-5 w-5 text-slate-950" />
          {isStarting ? "Preparando arena..." : "Start fight"}
        </button>

        <p className="text-xs text-slate-500">
          Timer oficial de 5:00 minutos por duelo.
        </p>
      </div>
    </div>
  );
}
