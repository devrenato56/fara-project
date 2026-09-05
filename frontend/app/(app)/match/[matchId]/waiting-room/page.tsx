"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Users, Loader2, ArrowLeft } from "lucide-react";

export default function MatchWaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = (params?.matchId as string) || "match-1";
  const problemId = searchParams.get("problemId") || "prob-3";

  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Simular que el contrincante acepta la invitación a los 3.5 segundos
    const joinTimeout = setTimeout(() => {
      router.push(`/match/${matchId}/arena?opponent=human&problemId=${problemId}`);
    }, 3500);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(joinTimeout);
    };
  }, [matchId, problemId, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Ícono de Sala de Espera */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <Users className="h-9 w-9" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          Enviando invitación{dots}
        </h1>

        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Esperando a que <strong>Alex Dev</strong> acepte el desafío en tiempo real.
        </p>

        <div className="my-8 flex items-center justify-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-600 dark:text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Sincronizando canal de proyecto...
          </span>
        </div>

        <button
          onClick={() => router.back()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </button>
      </div>
    </div>
  );
}
