"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, Trophy, Frown, ArrowRight, RotateCcw, Swords } from "lucide-react";
import Link from "next/link";

export interface ResultCardProps {
  mode: "solo" | "duelo_ai" | "duelo_humano";
  outcome: "won" | "lost";
  userScore: number;
  opponentScore?: number;
  userFeedback: string;
  opponentFeedback?: string;
  userTitle?: string;
  opponentName?: string;
  onRetry?: () => void;
  onNextProblem?: () => void;
  onViewSolution?: () => void;
  projectId?: string;
  problemId?: string;
}

export function ResultCard({
  mode,
  outcome,
  userScore,
  opponentScore,
  userFeedback,
  opponentFeedback,
  userTitle,
  opponentName = "Oponente",
  onRetry,
  onNextProblem,
  onViewSolution,
  projectId = "proj-1",
  problemId = "prob-1",
}: ResultCardProps) {
  const isWon = outcome === "won";

  useEffect(() => {
    if (isWon) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isWon]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      {/* Icono de resultado */}
      <div className="mb-4">
        {mode === "duelo_humano" && isWon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Trophy className="h-8 w-8 animate-bounce" />
          </div>
        ) : isWon ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            {mode === "duelo_ai" ? <Frown className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
          </div>
        )}
      </div>

      {/* Titulo del resultado */}
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        {userTitle ||
          (isWon
            ? mode === "solo"
              ? "¡Great! Resolviste el problema correctamente"
              : "¡You won! 🎉"
            : mode === "solo"
            ? "You can do it better!"
            : "You lost :(")}
      </h2>

      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {mode === "duelo_ai"
          ? isWon
            ? "Lograste enviar tu solución antes de que la IA completara el ejercicio."
            : "La IA resolvió mejor o más rápido este problema."
          : mode === "duelo_humano"
          ? isWon
            ? "Tu solución superó en eficiencia y precisión a tu rival."
            : "Tu oponente obtuvo una mejor calificación en esta ronda."
          : isWon
          ? "Tu implementación pasó los tests de ejecución y rúbrica de código."
          : "Revisa el feedback cualitativo y vuelve a intentarlo."}
      </p>

      {/* Puntajes */}
      <div className="my-8 flex items-center justify-center gap-8">
        {mode === "duelo_humano" ? (
          <>
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase text-neutral-500">Tú</span>
              <div
                className={`mt-1 flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                  isWon
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                } text-2xl font-extrabold`}
              >
                {userScore}
              </div>
              <span className="mt-1 text-xs text-neutral-500">Puntos</span>
            </div>

            <div className="text-xl font-bold text-neutral-400">VS</div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold uppercase text-neutral-500">{opponentName}</span>
              <div
                className={`mt-1 flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                  !isWon
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                } text-2xl font-extrabold`}
              >
                {opponentScore ?? 70}
              </div>
              <span className="mt-1 text-xs text-neutral-500">Puntos</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-neutral-900 bg-neutral-50 text-3xl font-extrabold text-neutral-900 shadow-sm dark:border-neutral-100 dark:bg-neutral-800 dark:text-neutral-100">
              {userScore}
            </div>
            <span className="mt-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Puntos obtenidos
            </span>
          </div>
        )}
      </div>

      {/* Feedback box */}
      <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left dark:border-neutral-800 dark:bg-neutral-950/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Feedback
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {userFeedback}
        </p>

        {mode === "duelo_humano" && opponentFeedback && (
          <div className="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Feedback para {opponentName}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {opponentFeedback}
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onViewSolution && (
          <button
            onClick={onViewSolution}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {mode === "solo" ? "Ver solución" : "Ver comparación"}
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="h-4 w-4" />
            Intentar de nuevo
          </button>
        )}

        {mode === "solo" && onNextProblem && (
          <button
            onClick={onNextProblem}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Siguiente problema
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {mode === "solo" && (
          <Link
            href={`/problems/${problemId}/fight`}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-900"
          >
            <Swords className="h-4 w-4 text-amber-400" />
            Switch to Fight Mode
          </Link>
        )}

        {(mode === "duelo_ai" || mode === "duelo_humano") && (
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Volver al proyecto
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
