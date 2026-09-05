"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { LoadingState } from "@/components/common/LoadingState";
import { ResultCard } from "@/components/common/ResultCard";
import { useApp } from "@/context/AppContext";
import { MOCK_AI_SCRIPT } from "@/lib/mock-data";

export default function MatchArenaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const matchId = (params?.matchId as string) || "match-1";
  const opponentType = (searchParams.get("opponent") as "ai" | "human") || "ai";
  const problemId = searchParams.get("problemId") || "prob-3";

  const { getProblem, user } = useApp();
  const problem = getProblem(problemId) || {
    id: problemId,
    projectId: "proj-1",
    title: "Concurrencia con Goroutines",
    starterCode: {
      go: `package main

import (
\t"fmt"
\t"sync"
)

// Tu solucion de worker pool en paralelo
func main() {
\tjobs := make(chan int, 10)
\tresults := make(chan int, 10)
\tvar wg sync.WaitGroup

\t// Escribe tu logica aqui...
}`,
    },
  };

  // Timer countdown: 300 segundos (5:00)
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [userCode, setUserCode] = useState(
    problem.starterCode?.go || "// Escribe tu solución aquí...\n"
  );
  const [aiCode, setAiCode] = useState(MOCK_AI_SCRIPT[0].code);
  const [aiStatusText, setAiStatusText] = useState(MOCK_AI_SCRIPT[0].description);
  const [matchState, setMatchState] = useState<"fighting" | "evaluating" | "result">("fighting");

  // Countdown timer
  useEffect(() => {
    if (matchState !== "fighting") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMatchState("evaluating");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchState]);

  // Simulación del guion de la IA avanzando y cometiendo errores
  useEffect(() => {
    if (matchState !== "fighting" || opponentType !== "ai") return;

    const t1 = setTimeout(() => {
      setAiCode(MOCK_AI_SCRIPT[1].code);
      setAiStatusText(MOCK_AI_SCRIPT[1].description);
    }, 4000);

    const t2 = setTimeout(() => {
      setAiCode(MOCK_AI_SCRIPT[2].code);
      setAiStatusText(MOCK_AI_SCRIPT[2].description);
    }, 10000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [matchState, opponentType]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleSendSolution = () => {
    setMatchState("evaluating");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Header de la Arena */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <button
          onClick={() => router.push(`/projects/${problem.projectId || "proj-1"}`)}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Arena · {problem.title}
        </button>

        {/* Timer Central Countdown */}
        <div className="flex items-center gap-2 rounded-2xl border-2 border-neutral-900 bg-neutral-900 px-5 py-2 text-white shadow-md dark:border-white dark:bg-white dark:text-neutral-900">
          <Clock className="h-4 w-4 animate-pulse text-amber-400" />
          <span className="font-mono text-xl font-black tracking-wider">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {matchState === "fighting" && (
          <button
            onClick={handleSendSolution}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Send className="h-3.5 w-3.5" />
            Enviar solución
          </button>
        )}
      </div>

      {/* Estados de la Arena */}
      {matchState === "evaluating" ? (
        <LoadingState
          title={
            opponentType === "ai"
              ? "Evaluando tu solución..."
              : "Evaluando ambas soluciones..."
          }
          subtitle="FARA está comparando el tiempo de ejecución, uso de memoria y corrección algorítmica."
          durationMs={2500}
          onComplete={() => setMatchState("result")}
        />
      ) : matchState === "result" ? (
        opponentType === "ai" ? (
          <ResultCard
            mode="duelo_ai"
            outcome="won"
            userScore={88}
            userFeedback="¡Excelente velocidad! Implementaste el canal con buffer y evitaste el bloqueo antes que la IA completara su refactorización."
            onRetry={() => {
              setSecondsLeft(300);
              setMatchState("fighting");
            }}
            onViewSolution={() => setMatchState("fighting")}
            projectId={problem.projectId || "proj-1"}
            problemId={problem.id}
          />
        ) : (
          <ResultCard
            mode="duelo_humano"
            outcome="won"
            userScore={87}
            opponentScore={72}
            opponentName="Alex Dev"
            userFeedback="Tu solución fue más eficiente en tiempo y uso de memoria. Excelente manejo de concurrencia."
            opponentFeedback="Alex tuvo una solución funcional pero con un delay adicional en el cierre del WaitGroup."
            onRetry={() => {
              setSecondsLeft(300);
              setMatchState("fighting");
            }}
            onViewSolution={() => setMatchState("fighting")}
            projectId={problem.projectId || "proj-1"}
            problemId={problem.id}
          />
        )
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
                  <span className="ml-2 font-mono text-xs text-neutral-400">main.go</span>
                </div>
              </div>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Go 1.22
              </span>
            </div>

            <div className="mt-3 flex-1 min-h-[460px]">
              <CodeEditor
                language="go"
                value={userCode}
                onChange={setUserCode}
                height="460px"
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
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {opponentType === "ai" ? "FARA AI Opponent" : "Alex Dev (Rival)"}
                  </span>
                  <span className="ml-2 font-mono text-xs text-neutral-400">main.go</span>
                </div>
              </div>

              {opponentType === "ai" && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Escribiendo en vivo...</span>
                </div>
              )}
            </div>

            {/* Aviso de Simulación Pedagógica de la IA */}
            {opponentType === "ai" && aiStatusText && (
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <strong>Simulación pedagógica:</strong> {aiStatusText}
              </div>
            )}

            <div className="mt-3 flex-1 min-h-[460px] opacity-90 pointer-events-none">
              <CodeEditor
                language="go"
                value={aiCode}
                height="460px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
