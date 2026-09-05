"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  GitBranch,
  Pencil,
  Share2,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Code2,
  Swords,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { InviteTeamModal } from "@/components/projects/InviteTeamModal";
import { supabase } from "@/lib/supabase-client";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "proj-1";
  const { getProject, getProblems, fetchProject } = useApp();

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    fetchProject(projectId);

    // Si se entra a la pantalla mientras la generacion sigue corriendo,
    // vuelve a pedir el detalle cuando llegue el evento de Realtime.
    const channel = supabase
      .channel(`project:${projectId}`)
      .on("broadcast", { event: "problems.ready" }, () => fetchProject(projectId))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const project = getProject(projectId);
  const problems = getProblems(projectId);

  if (!project) {
    return <div className="p-8 text-sm text-neutral-500">Cargando proyecto...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Completado
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            En progreso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            <Circle className="h-2.5 w-2.5" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <Link href="/projects" className="hover:text-neutral-900 dark:hover:text-white">
          Your projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-neutral-900 dark:text-white">{project.name}</span>
      </nav>

      {/* Header del Proyecto */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              {project.name}
            </h1>
            <button
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
              title="Editar nombre"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {/* Repositorios Conectados */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Repositorios:
            </span>
            {project.repositories.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-mono text-neutral-700 shadow-xs hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <GitBranch className="h-3 w-3 text-neutral-500" />
                <span>{repo.fullName}</span>
                <ExternalLink className="h-2.5 w-2.5 text-neutral-400" />
              </a>
            ))}
          </div>
        </div>

        {/* Botón Compartir / Your Team */}
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 self-start rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          <Share2 className="h-4 w-4" />
          Compartir / Your Team
        </button>
      </div>

      {/* Métricas del Proyecto */}
      <div className="grid grid-cols-3 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Problemas
          </span>
          <span className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">
            {project.problemsCount || problems.length}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Completados
          </span>
          <span className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">
            {project.completedCount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Progreso
          </span>
          <span className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {project.progressPercent}%
          </span>
        </div>
      </div>

      {/* Lista: Problemas Propuestos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Problemas propuestos
          </h2>
          <span className="text-xs text-neutral-400">
            Generados a partir del código de tus repositorios
          </span>
        </div>

        <div className="space-y-4">
          {problems.map((problem, index) => (
            <div
              key={problem.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 md:flex-row md:items-center"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-neutral-400">
                    {index + 1}.
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {problem.title}
                  </h3>
                  {getStatusBadge(problem.status)}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      problem.difficulty === "easy"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : problem.difficulty === "medium"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {problem.description}
                </p>

                {/* Fuente y Adaptable a */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                  {problem.sourceUrl && (
                    <a
                      href={problem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <span>Fuente GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400">
                      Adaptable a:
                    </span>
                    <div className="flex items-center gap-1">
                      {problem.adaptableTo.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones Code y Fight */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <Link
                  href={`/problems/${problem.id}/code`}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-800 shadow-2xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Code
                </Link>

                <Link
                  href={`/problems/${problem.id}/fight`}
                  className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  <Swords className="h-3.5 w-3.5 text-amber-400" />
                  Fight
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Invitar al Equipo */}
      <InviteTeamModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        projectId={project.id}
        inviteToken={project.inviteToken}
        members={project.members || []}
      />
    </div>
  );
}
