"use client";

import React, { useState } from "react";
import { X, GitBranch, Check, Sparkles } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_REPOS = [
  "usuario/api-tareas",
  "usuario/auth-service",
  "usuario/payment-processor",
  "usuario/utils",
  "usuario/shop-backend",
];

const AVAILABLE_TECHS = [
  { name: "Go", icon: "⚡" },
  { name: "Docker", icon: "🐳" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Redis", icon: "🔴" },
  { name: "Rust", icon: "🦀" },
  { name: "TypeScript", icon: "🟦" },
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { createProject } = useApp();

  const [activeProvider, setActiveProvider] = useState<"github" | "gitlab" | "bitbucket">("github");
  const [selectedRepos, setSelectedRepos] = useState<string[]>(["usuario/api-tareas"]);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>(["Go", "Docker"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleRepo = (repo: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    );
  };

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || selectedRepos.length === 0) return;

    setIsGenerating(true);

    const newProject = await createProject({
      name: projectName.trim(),
      description: description.trim(),
      repositories: selectedRepos,
      technologies: selectedTechs.length > 0 ? selectedTechs : ["Go"],
    });

    setCreatedProjectId(newProject.id);
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
    onClose();
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {isGenerating ? (
          <LoadingState
            title="Generando tus problemas..."
            subtitle="Analizando tu código en repositorios y creando ejercicios personalizados para ti."
            durationMs={2800}
            onComplete={handleGenerationComplete}
          />
        ) : (
          <>
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Crear nuevo proyecto
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
              {/* Paso 1: Conectar repositorios */}
              <div>
                <label className="text-sm font-bold text-neutral-900 dark:text-white">
                  1. Conecta tus repositorios (obligatorio)
                </label>

                {/* Tabs de Proveedores */}
                <div className="mt-2 flex rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => setActiveProvider("github")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      activeProvider === "github"
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProvider("gitlab")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      activeProvider === "gitlab"
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    GitLab
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProvider("bitbucket")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      activeProvider === "bitbucket"
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Bitbucket
                  </button>
                </div>

                {/* Selección de repositorios */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-xs text-neutral-500">
                    Selecciona los repositorios con código fuente que servirá de puente:
                  </div>
                  <div className="max-h-32 overflow-y-auto rounded-xl border border-neutral-200 p-2 dark:border-neutral-800">
                    {AVAILABLE_REPOS.map((repo) => {
                      const isSelected = selectedRepos.includes(repo);
                      return (
                        <div
                          key={repo}
                          onClick={() => toggleRepo(repo)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                            isSelected
                              ? "bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-white"
                              : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{repo}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Solo puedes seleccionar repositorios a los que tengas acceso.
                  </p>
                </div>
              </div>

              {/* Paso 2: Configurar proyecto */}
              <div>
                <label className="text-sm font-bold text-neutral-900 dark:text-white">
                  2. Configura tu proyecto
                </label>

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Nombre del proyecto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. API de Usuarios"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 shadow-xs focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="¿Qué hace este proyecto?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 shadow-xs focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Tecnologías que deseas aprender / practicar (Battle Stack)
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {AVAILABLE_TECHS.map((tech) => {
                        const isSelected = selectedTechs.includes(tech.name);
                        return (
                          <button
                            key={tech.name}
                            type="button"
                            onClick={() => toggleTech(tech.name)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              isSelected
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            }`}
                          >
                            <span>{tech.icon}</span>
                            <span>{tech.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={!projectName.trim() || selectedRepos.length === 0}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Sparkles className="h-4 w-4" />
                Crear proyecto
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
