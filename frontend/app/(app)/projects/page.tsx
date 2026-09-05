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
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Pon tus capacidades en acción.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Plus className="h-4 w-4" />
          New project
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 pr-2">
          <Filter className="h-3.5 w-3.5" />
          Filtros:
        </div>

        {/* Filtro Tecnologías */}
        <div className="flex items-center gap-1.5">
          {["Go", "Docker", "PostgreSQL", "Redis"].map((tech) => {
            const isSelected = selectedTechFilter === tech;
            return (
              <button
                key={tech}
                onClick={() => setSelectedTechFilter(isSelected ? null : tech)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
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
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            onlyPremium
              ? "bg-purple-600 text-white"
              : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          Premium
        </button>

        {(selectedTechFilter || onlyPremium) && (
          <button
            onClick={clearFilters}
            className="ml-auto text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid de Proyectos */}
      {filteredProjects.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
          <FolderGit2 className="h-12 w-12 text-neutral-400" />
          <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
            No se encontraron proyectos
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Crea tu primer proyecto vinculando un repositorio de GitHub para generar problemas.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            Crear proyecto ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <GitBranch className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="truncate max-w-[180px]">
                      {project.repositories[0]?.fullName || "owner/repo"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Titulo */}
                <h3 className="mt-3 text-lg font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 dark:text-white dark:group-hover:text-neutral-200">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {project.description}
                  </p>
                )}

                {/* Tecnologías */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Tecnologías
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer de Tarjeta: Progreso y Fecha */}
              <div className="mt-6 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{project.updatedAt || "Actualizado"}</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {project.completedCount}/{project.problemsCount} resueltos
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
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
