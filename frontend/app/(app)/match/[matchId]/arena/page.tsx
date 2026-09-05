"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Send,
  Bot,
  User as UserIcon,
  Flag,
} from "lucide-react";
import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { LoadingState } from "@/components/common/LoadingState";
import { ResultCard } from "@/components/common/ResultCard";
import { useApp } from "@/context/AppContext";
import { apiClient } from "@/lib/api-client";
import { mapMatch, mapProblem } from "@/lib/mappers";
import { versionFor } from "@/lib/runtimes";
import { supabase } from "@/lib/supabase-client";
import { Match, Problem } from "@/types";

type ArenaState = "loading" | "fighting" | "evaluating" | "waiting_rival" | "result";

interface ArenaResult {
  outcome: "won" | "lost";
  score: number;
  feedback: string;
  opponentScore?: number | null;
  opponentFeedback?: string | null;
}

export default function MatchArenaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useApp();

  const matchId = params?.matchId as string;
  const opponentType = (searchParams.get("opponent") as "ai" | "human") || "ai";
  const language = searchParams.get("lang") || "go";
  const shouldJoin = searchParams.get("join") === "1";

  const [match, setMatch] = useState<Match | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [state, setState] = useState<ArenaState>("loading");
  const [result, setResult] = useState<ArenaResult | null>(null);
  const [userCode, setUserCode] = useState("// Escribe tu solución aquí...\n");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Evita que el cierre por timer se dispare dos veces.
  const closingRef = useRef(false);

  // 1. Cargar el match (uniendose primero si se entro por el enlace del rival)
  useEffect(() => {
    (async () => {
      try {
        if (shouldJoin) {
          try {
            await apiClient.post(`/matches/${matchId}/join`);
          } catch {
            // 409 = el duelo ya arranco o ya estabas dentro: seguimos igual.
          }
        }
        const raw = await apiClient.get<any>(`/matches/${matchId}`);
        const loaded = mapMatch(raw);
        setMatch(loaded);

        const problemRaw = await apiClient.get<any>(`/problems/${loaded.problemId}`);
        setProblem(mapProblem(problemRaw));

        setState(loaded.status === "finished" ? "result" : "fighting");
      } catch {
        router.push("/projects");
      }
    })();
  }, [matchId, shouldJoin, router]);

  // 2. Timer y reloj de la arena, calculados contra el started_at del servidor
  useEffect(() => {
    if (!match?.startedAt || state !== "fighting") return;

    const tick = () => {
      const started = new Date(match.startedAt!).getTime();
      const secs = Math.floor((Date.now() - started) / 1000);
      setElapsed(secs);
      setSecondsLeft(Math.max(0, match.durationSec - secs));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [match, state]);

  const closeByTimeout = useCallback(async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setState("evaluating");
    try {
      const res = await apiClient.post<any>(`/matches/${matchId}/finish`);
      setResult({
        outcome: res.outcome === "won" ? "won" : "lost",
        score: res.score,
        feedback: res.feedback,
        opponentScore: res.opponent_score,
        opponentFeedback: res.opponent_feedback,
      });
    } catch {
      setResult({
        outcome: "lost",
        score: 0,
        feedback: "Se acabó el tiempo antes de enviar una solución.",
      });
    }
    setState("result");
  }, [matchId]);

  // 3. Timer en 0 -> cierra el duelo
  useEffect(() => {
    if (state === "fighting" && match?.startedAt && secondsLeft === 0 && elapsed > 0) {
      closeByTimeout();
    }
  }, [secondsLeft, elapsed, state, match, closeByTimeout]);

  // 4. Realtime: el rival cierra el duelo, o lo abandona
  useEffect(() => {
    if (!matchId || !user?.id) return;

    const applyFinished = (payload: any) => {
      const results = payload?.payload?.results ?? {};
      const winnerId = payload?.payload?.winner_id ?? null;
      const mine = results[user.id];
      const rivalEntry = Object.entries(results).find(([id]) => id !== user.id);
      const rival = rivalEntry?.[1] as any;

      closingRef.current = true;
      setResult({
        outcome: winnerId === user.id ? "won" : "lost",
        score: mine?.score ?? 0,
        feedback: mine?.feedback ?? "No enviaste una solución antes de que cerrara el duelo.",
        opponentScore: rival?.score ?? null,
        opponentFeedback: rival?.feedback ?? null,
      });
      setState("result");
    };

    const channel = supabase
      .channel(`match:${matchId}`)
      .on("broadcast", { event: "match.finished" }, applyFinished)
      .on("broadcast", { event: "match.abandoned" }, (payload: any) => {
        closingRef.current = true;
        setResult({
          outcome: payload?.payload?.winner_id === user.id ? "won" : "lost",
          score: 0,
          feedback: "El duelo terminó por abandono de uno de los participantes.",
        });
        setState("result");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user?.id]);

  const handleSendSolution = async () => {
    setState("evaluating");
    try {
      const res = await apiClient.post<any>(`/matches/${matchId}/submissions`, {
        code: userCode,
        language,
        version: versionFor(language),
      });

      if (res.outcome === "pending") {
        // vs Humano: ya enviaste, falta el rival.
        setResult({ outcome: "lost", score: res.score, feedback: res.feedback });
        setState("waiting_rival");
        return;
      }

      closingRef.current = true;
      setResult({
        outcome: res.outcome === "won" ? "won" : "lost",
        score: res.score,
        feedback: res.feedback,
        opponentScore: res.opponent_score,
        opponentFeedback: res.opponent_feedback,
      });
      setState("result");
    } catch {
      setResult({
        outcome: "lost",
        score: 0,
        feedback: "No se pudo evaluar tu envío. Revisa tu conexión e intenta de nuevo.",
      });
      setState("result");
    }
  };

  const handleAbandon = async () => {
    try {
      await apiClient.post(`/matches/${matchId}/abandon`);
    } catch {
      // Ignorar: igual salimos.
    }
    router.push(`/projects/${problem?.projectId ?? ""}`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins.toString().padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;
  };

  // Paso actual del guion de la IA: el ultimo cuyo time_sec ya paso.
  const aiSteps = match?.aiRevealScript ?? [];
  const currentAiStep =
    aiSteps.length > 0
      ? [...aiSteps].reverse().find((s) => s.timeSec <= elapsed) ?? aiSteps[0]
      : null;

  if (state === "loading" || !match || !problem) {
    return <div className="p-8 text-sm text-neutral-500">Preparando la arena...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Header de la Arena */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <button
          onClick={() => router.push(`/projects/${problem.projectId}`)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Arena · {problem.title}
        </button>

        {/* Timer contra el started_at del servidor */}
        <div className="flex items-center gap-2 rounded-2xl border-2 border-neutral-900 bg-neutral-900 px-5 py-2 text-white shadow-md dark:border-white dark:bg-white dark:text-neutral-900">
          <Clock className="h-4 w-4 animate-pulse text-amber-400" />
          <span className="font-mono text-xl font-black tracking-wider">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {state === "fighting" && (
          <div className="flex items-center gap-2">
            {opponentType === "human" && (
              <button
                onClick={handleAbandon}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Flag className="h-3.5 w-3.5" />
                Abandonar
              </button>
            )}
            <button
              onClick={handleSendSolution}
              className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar solución
            </button>
          </div>
        )}
      </div>

      {/* Estados de la Arena */}
      {state === "evaluating" ? (
        <LoadingState
          title={
            opponentType === "ai" ? "Evaluando tu solución..." : "Evaluando ambas soluciones..."
          }
          subtitle="Ejecutando el código en Piston y calificándolo con el Agente Evaluador."
          targetPercent={95}
          durationMs={3000}
        />
      ) : state === "waiting_rival" ? (
        <LoadingState
          title="Esperando a que tu rival envíe..."
          subtitle={`Tu solución ya fue evaluada (${result?.score ?? 0}/100). El resultado final se revela cuando tu oponente envíe o se acabe el tiempo.`}
          targetPercent={80}
          durationMs={2000}
        />
      ) : state === "result" && result ? (
        <ResultCard
          mode={opponentType === "ai" ? "duelo_ai" : "duelo_humano"}
          outcome={result.outcome}
          userScore={result.score}
          userFeedback={result.feedback}
          opponentScore={result.opponentScore ?? undefined}
          opponentFeedback={result.opponentFeedback ?? undefined}
          opponentName={opponentType === "ai" ? "FARA AI" : "Rival"}
          projectId={problem.projectId}
          problemId={problem.id}
        />
      ) : (
        /* Modo Combate Activo: Dos Columnas Enfrentadas */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Columna Izquierda: Tú */}
          <div className="flex flex-col rounded-3xl border-2 border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    Tú ({user.username})
                  </span>
                </div>
              </div>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {language}
              </span>
            </div>

            {/* Enunciado compacto */}
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              {problem.description}
            </p>

            <div className="mt-3 flex-1 min-h-[420px]">
              <CodeEditor
                language={language}
                value={userCode}
                onChange={setUserCode}
                height="420px"
              />
            </div>
          </div>

          {/* Columna Derecha: IA u Oponente Humano */}
          <div className="flex flex-col rounded-3xl border-2 border-neutral-300 bg-neutral-50/70 p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                  {opponentType === "ai" ? (
                    <Bot className="h-4 w-4 text-amber-400" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {opponentType === "ai" ? "FARA AI Opponent" : "Rival"}
                </span>
              </div>

              {opponentType === "ai" && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Escribiendo en vivo...</span>
                </div>
              )}
            </div>

            {opponentType === "ai" ? (
              <>
                {currentAiStep?.description && (
                  <div
                    className={`mt-2 rounded-xl border px-3 py-1.5 text-xs ${
                      currentAiStep.isBuggy
                        ? "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
                        : "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                    }`}
                  >
                    <strong>
                      {currentAiStep.isBuggy ? "Cometiendo un error:" : "Simulación pedagógica:"}
                    </strong>{" "}
                    {currentAiStep.description}
                  </div>
                )}

                <div className="mt-3 flex-1 min-h-[420px] opacity-90 pointer-events-none">
                  <CodeEditor
                    language={language}
                    value={currentAiStep?.code ?? ""}
                    height="420px"
                  />
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-1 min-h-[420px] items-center justify-center rounded-xl border border-dashed border-neutral-300 text-center dark:border-neutral-700">
                <div className="px-6">
                  <UserIcon className="mx-auto h-8 w-8 text-neutral-400" />
                  <p className="mt-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Tu rival está resolviendo en paralelo
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Por juego limpio, su código permanece oculto hasta que ambos envíen.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
