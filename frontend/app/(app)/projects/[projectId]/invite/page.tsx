"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Users, CheckCircle2, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ProjectInvitePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) || "proj-1";

  const { getProject, user } = useApp();
  const project = getProject(projectId);

  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    setJoined(true);
    setTimeout(() => {
      router.push(`/projects/${projectId}`);
    }, 1200);
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <Users className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          Invitación a Proyecto
        </h1>

        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Has sido invitado a colaborar y competir en el proyecto{" "}
          <strong className="text-neutral-900 dark:text-white">
            {project?.name || "Proyecto FARA"}
          </strong>
          .
        </p>

        <div className="my-6 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-left dark:border-neutral-800 dark:bg-neutral-950">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Detalles de membresía
          </div>
          <div className="mt-2 text-sm">
            <span className="text-neutral-500">Usuario:</span>{" "}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {user.username}
            </span>
          </div>
          <div className="mt-1 text-sm">
            <span className="text-neutral-500">Rol:</span>{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              ProjectMember (Invitado de duelo)
            </span>
          </div>
        </div>

        {joined ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            ¡Te has unido con éxito! Redirigiendo...
          </div>
        ) : (
          <button
            onClick={handleJoin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Aceptar invitación y unirse
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <div className="mt-4">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            Cancelar y volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
