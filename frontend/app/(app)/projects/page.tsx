"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  MoreVertical,
  Sparkles,
  GitBranch,
  Filter,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

export default function ProjectsPage() {
  const { projects } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTechFilter, setSelectedTechFilter] = useState<string | null>(null);
  const [onlyPremium, setOnlyPremium] = useState(false);

  const filteredProjects = projects.filter((p) => {
    if (selectedTechFilter && !p.technologies.includes(selectedTechFilter)) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedTechFilter(null);
    setOnlyPremium(false);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pon tus capacidades en acción.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-3 lg:p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pr-2">
          <Filter className="h-3.5 w-3.5" />
          Filtros:
        </div>

        {/* Filtro Tecnologías */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["Go", "Docker", "PostgreSQL", "Redis"].map((tech) => {
            const isSelected = selectedTechFilter === tech;
            return (
              <button
                key={tech}
                onClick={() => setSelectedTechFilter(isSelected ? null : tech)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer min-h-[32px] ${
                  isSelected
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "border border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300"
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>

        {/* Filtro Premium */}
        <button
          onClick={() => setOnlyPremium(!onlyPremium)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer min-h-[32px] ${
            onlyPremium
              ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
              : "border border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Premium
        </button>

        {(selectedTechFilter || onlyPremium) && (
          <button
            onClick={clearFilters}
            className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid de Proyectos */}
      {filteredProjects.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 p-8 text-center">
          <FolderGit2 className="h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-base font-bold text-slate-200">
            No se encontraron proyectos
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Crea tu primer proyecto vinculando un repositorio de GitHub para generar problemas.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Crear proyecto ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 lg:p-5 transition-all hover:border-slate-700/60 hover:bg-slate-800/40"
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono">
                    <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                    <span className="truncate max-w-[180px]">
                      {project.repositories[0]?.fullName || "owner/repo"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Titulo */}
                <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-200 group-hover:text-slate-100">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {project.description}
                  </p>
                )}

                {/* Tecnologías */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-xs font-medium text-slate-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer de Tarjeta: Progreso y Fecha */}
              <div className="mt-5 border-t border-slate-800/60 pt-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{project.updatedAt || "Actualizado"}</span>
                  <span className="font-semibold text-slate-300">
                    {project.completedCount}/{project.problemsCount} resueltos
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal de Crear Proyecto */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
