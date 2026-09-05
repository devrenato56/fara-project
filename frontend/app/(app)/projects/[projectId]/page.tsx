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
    return <div className="p-8 text-sm text-slate-500">Cargando proyecto...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Completado
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
            <Clock className="h-3 w-3" />
            En progreso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700/60 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
            <Circle className="h-2.5 w-2.5" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/projects" className="hover:text-slate-300 transition-colors">
          Your projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-slate-300">{project.name}</span>
      </nav>

      {/* Header del Proyecto */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
              {project.name}
            </h1>
            <button
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 cursor-pointer transition-colors"
              title="Editar nombre"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {/* Repositorios Conectados */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {project.repositories.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-mono text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
              >
                <GitBranch className="h-3 w-3 text-slate-500" />
                <span>{repo.fullName}</span>
                <ExternalLink className="h-2.5 w-2.5 text-slate-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Botón Compartir */}
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700/60 cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          Compartir / Your Team
        </button>
      </div>

      {/* Métricas del Proyecto */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 lg:p-5">
        <div className="flex flex-col">
          <span className="text-[11px] lg:text-xs font-semibold text-slate-500">
            Problemas
          </span>
          <span className="mt-1 text-xl lg:text-2xl font-bold text-slate-100">
            {project.problemsCount || problems.length}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] lg:text-xs font-semibold text-slate-500">
            Completados
          </span>
          <span className="mt-1 text-xl lg:text-2xl font-bold text-slate-100">
            {project.completedCount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] lg:text-xs font-semibold text-slate-500">
            Progreso
          </span>
          <span className="mt-1 text-xl lg:text-2xl font-bold text-emerald-400">
            {project.progressPercent}%
          </span>
        </div>
      </div>

      {/* Lista: Problemas Propuestos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-bold text-slate-200">
            Problemas propuestos
          </h2>
          <span className="text-xs text-slate-500">
            Generados a partir del código de tus repositorios
          </span>
        </div>

        <div className="space-y-3">
          {problems.map((problem, index) => (
            <div
              key={problem.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 lg:p-5 transition-colors hover:border-slate-700/60 md:flex-row md:items-center"
            >
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {index + 1}.
                  </span>
                  <h3 className="text-base font-bold text-slate-200">
                    {problem.title}
                  </h3>
                  {getStatusBadge(problem.status)}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                      problem.difficulty === "easy"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : problem.difficulty === "medium"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {problem.description}
                </p>

                {/* Fuente y Adaptable a */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                  {problem.sourceUrl && (
                    <a
                      href={problem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <span>Fuente GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">
                      Adaptable a:
                    </span>
                    <div className="flex items-center gap-1">
                      {problem.adaptableTo.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-400"
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
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700/60 cursor-pointer min-h-[40px]"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Code
                </Link>

                <Link
                  href={`/problems/${problem.id}/fight`}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/15 transition-all hover:bg-emerald-400 cursor-pointer min-h-[40px]"
                >
                  <Swords className="h-3.5 w-3.5" />
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
