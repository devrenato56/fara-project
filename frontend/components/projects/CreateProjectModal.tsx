"use client";

import React, { useState, useEffect } from "react";
import { X, GitBranch, Check, Sparkles, Plus, Layers, ArrowRight } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_REPOS = [
  "usuario/api-tareas",
  "usuario/auth-service",
  "gin-gonic/gin",
  "expressjs/express",
  "pallets/flask",
];

const AVAILABLE_TECHS = [
  { name: "Go", icon: "⚡" },
  { name: "Docker", icon: "🐳" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Redis", icon: "🔴" },
  { name: "Rust", icon: "🦀" },
  { name: "TypeScript", icon: "🟦" },
  { name: "Python", icon: "🐍" },
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { createProject } = useApp();

  const [activeProvider, setActiveProvider] = useState<"github" | "gitlab" | "bitbucket">("github");
  const [selectedRepos, setSelectedRepos] = useState<string[]>(["usuario/api-tareas"]);
  const [customRepoInput, setCustomRepoInput] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>(["Go", "Docker"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [problemsReady, setProblemsReady] = useState(false);

  useEffect(() => {
    if (!createdProjectId) return;

    const timer = setTimeout(() => {
      setProblemsReady(true);
    }, 4500);

    const channel = supabase
      .channel(`project:${createdProjectId}`)
      .on("broadcast", { event: "problems.ready" }, () => setProblemsReady(true))
      .on("broadcast", { event: "problems.failed" }, () => setProblemsReady(true))
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [createdProjectId]);

  useEffect(() => {
    if (!problemsReady || !createdProjectId) return;
    setIsGenerating(false);
    onClose();
    router.push(`/projects/${createdProjectId}`);
  }, [problemsReady, createdProjectId]);

  if (!isOpen) return null;

  const toggleRepo = (repo: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    );
  };

  const handleAddCustomRepo = () => {
    const trimmed = customRepoInput.trim();
    if (trimmed && !selectedRepos.includes(trimmed)) {
      setSelectedRepos((prev) => [...prev, trimmed]);
      setCustomRepoInput("");
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-neutral-200 bg-white/95 p-7 shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900/95 dark:shadow-neutral-950/80">
        
        {/* Glow ambient background effect */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

        {isGenerating ? (
          <LoadingState
            title="Generando tus problemas..."
            subtitle="Analizando tu código fuente y creando ejercicios de traducción técnica adaptados a ti."
            targetPercent={95}
            durationMs={4000}
          />
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-5 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                    Crear nuevo proyecto
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Vincular repositorios para generar problemas de práctica
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
              {/* Step 1: Conectar repositorios */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-black text-white dark:bg-white dark:text-neutral-900">
                      1
                    </span>
                    Repositorios de Origen
                  </label>
                  <span className="text-[11px] font-medium text-neutral-400">
                    {selectedRepos.length} seleccionado(s)
                  </span>
                </div>

                {/* Tabs de Proveedores */}
                <div className="flex rounded-xl border border-neutral-200 bg-neutral-100/60 p-1 dark:border-neutral-800 dark:bg-neutral-950/60">
                  {(["github", "gitlab", "bitbucket"] as const).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setActiveProvider(provider)}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition ${
                        activeProvider === provider
                          ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>

                {/* Chips de Repositorios Seleccionados */}
                {selectedRepos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedRepos.map((repo) => (
                      <span
                        key={repo}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-100/80 px-3 py-1 text-xs font-mono font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        <GitBranch className="h-3 w-3 text-neutral-400" />
                        {repo}
                        <button
                          type="button"
                          onClick={() => toggleRepo(repo)}
                          className="ml-1 text-neutral-400 hover:text-rose-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input para agregar repo personalizado */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Añadir repo (ej. owner/repository)"
                      value={customRepoInput}
                      onChange={(e) => setCustomRepoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomRepo();
                        }
                      }}
                      className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomRepo}
                    className="flex items-center gap-1 rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Añadir
                  </button>
                </div>

                {/* Presets Rápidos */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400">
                    O selecciona de repositorios sugeridos:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PRESET_REPOS.map((repo) => {
                      const isSelected = selectedRepos.includes(repo);
                      return (
                        <button
                          key={repo}
                          type="button"
                          onClick={() => toggleRepo(repo)}
                          className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-medium transition ${
                            isSelected
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {repo} {isSelected && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Configurar proyecto y Battle Stack */}
              <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-black text-white dark:bg-white dark:text-neutral-900">
                    2
                  </span>
                  Configuración del Proyecto & Battle Stack
                </label>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Nombre del proyecto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. API de Usuarios & Autenticación"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 shadow-xs focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Descripción corta (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Microservicio de autenticación y transacciones"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-neutral-900 shadow-xs focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Tecnologías objetivo a practicar (Battle Stack)
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {AVAILABLE_TECHS.map((tech) => {
                        const isSelected = selectedTechs.includes(tech.name);
                        return (
                          <button
                            key={tech.name}
                            type="button"
                            onClick={() => toggleTech(tech.name)}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900 scale-102"
                                : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            }`}
                          >
                            <span>{tech.icon}</span>
                            <span>{tech.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!projectName.trim() || selectedRepos.length === 0}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-neutral-800 hover:shadow-xl disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-400 dark:text-amber-500" />
                <span>Generar Proyecto & Problemas</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
