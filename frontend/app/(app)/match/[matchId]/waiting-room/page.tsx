"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Users, Loader2, ArrowLeft, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { apiClient } from "@/lib/api-client";

export default function MatchWaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = (params?.matchId as string) || "match-1";
  const problemId = searchParams.get("problemId") || "";
  const lang = searchParams.get("lang") || "go";

  const [dots, setDots] = useState("");
  const [copied, setCopied] = useState(false);

  const arenaUrl = `/match/${matchId}/arena?opponent=human&problemId=${problemId}&lang=${lang}`;
  const joinUrl =
    typeof window !== "undefined" ? `${window.location.origin}${arenaUrl}&join=1` : "";

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  // El rival entra por el enlace y llama a /join; el backend publica match.started.
  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on("broadcast", { event: "match.started" }, () => router.push(arenaUrl))
      .subscribe();

    // Fallback por si el evento se pierde: consulta el estado cada 5s.
    const poll = setInterval(async () => {
      try {
        const match = await apiClient.get<any>(`/matches/${matchId}`);
        if (match.status === "in_progress") router.push(arenaUrl);
      } catch {
        // Ignorar: seguimos esperando.
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [matchId, arenaUrl, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    try {
      await apiClient.post(`/matches/${matchId}/abandon`);
    } catch {
      // Ignorar: igual salimos de la sala.
    }
    router.back();
  };

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
          Esperando rival{dots}
        </h1>

        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Comparte este enlace con tu oponente. El duelo arranca automáticamente
          cuando se una.
        </p>

        {/* Enlace de la sala */}
        <div className="mt-5 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={joinUrl}
            className="flex-1 select-all rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="my-8 flex items-center justify-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-600 dark:text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Escuchando el canal del duelo...
          </span>
        </div>

        <button
          onClick={handleCancel}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancelar duelo
        </button>
      </div>
    </div>
  );
}
