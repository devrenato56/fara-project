"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, GitBranch, Check, Sparkles, Plus, Layers, ArrowRight, Search, Loader2 } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { apiClient } from "@/lib/api-client";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_TECHS = [
  { name: "Go", color: "bg-cyan-400" },
  { name: "Docker", color: "bg-sky-400" },
  { name: "PostgreSQL", color: "bg-indigo-400" },
  { name: "Redis", color: "bg-rose-400" },
  { name: "Rust", color: "bg-orange-400" },
  { name: "TypeScript", color: "bg-blue-400" },
  { name: "Python", color: "bg-amber-400" },
];

interface GitHubRepo {
  id: number;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { createProject, user } = useApp();

  const [activeProvider, setActiveProvider] = useState<"github" | "gitlab" | "bitbucket">("github");
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GitHubRepo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>(["Go"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [problemsReady, setProblemsReady] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [needsManualUsername, setNeedsManualUsername] = useState(false);

  // Fetch my repos on mount — let the backend resolve the GitHub username
  useEffect(() => {
    if (!user?.username) return;

    const fetchMyRepos = async () => {
      setIsSearching(true);
      setFetchError(null);
      try {
        // Try without explicit username first (backend extracts from Supabase identity)
        const results = await apiClient.get<GitHubRepo[]>("/github/my-repos");
        setSearchResults(results);
        setNeedsManualUsername(false);
      } catch (e: any) {
        console.warn("Auto-detect GitHub username failed, trying with profile username...", e);
        try {
          // Fallback: try with the profile username
          const results = await apiClient.get<GitHubRepo[]>(`/github/my-repos?username=${user.username}`);
          setSearchResults(results);
          setNeedsManualUsername(false);
        } catch (e2: any) {
          console.error("Failed to fetch GitHub repos", e2);
          setNeedsManualUsername(true);
          setFetchError("No se pudo detectar tu usuario de GitHub. Ingresa tu username abajo.");
        }
      } finally {
        setIsSearching(false);
      }
    };

    fetchMyRepos();
  }, [user?.username]);

  // Fetch repos when manual GitHub username is provided
  const handleFetchByUsername = async () => {
    let trimmed = githubUsername.trim();
    if (!trimmed) return;
    
    // Si el usuario pego la URL completa o uso un arroba, lo limpiamos
    if (trimmed.includes('github.com/')) {
      trimmed = trimmed.split('github.com/')[1].split('/')[0];
    }
    if (trimmed.startsWith('@')) {
      trimmed = trimmed.substring(1);
    }
    
    setIsSearching(true);
    setFetchError(null);
    try {
      const results = await apiClient.get<GitHubRepo[]>(`/github/search-repos?username=${trimmed}`);
      setSearchResults(results);
      setNeedsManualUsername(false);
    } catch (e: any) {
      setFetchError(`No se encontraron repos para "${trimmed}". Verifica el username.`);
    } finally {
      setIsSearching(false);
    }
  };

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
    const trimmed = searchQuery.trim();
    if (trimmed && !selectedRepos.includes(trimmed)) {
      setSelectedRepos((prev) => [...prev, trimmed]);
      setSearchQuery("");
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700/60 bg-slate-900 p-4 sm:p-6 lg:p-8 shadow-2xl">

        {isGenerating ? (
          <LoadingState
            title="Generando tus problemas..."
            subtitle="Analizando tu código fuente y creando ejercicios de traducción técnica adaptados a ti."
            targetPercent={95}
            durationMs={4000}
          />
        ) : (
          <div className="relative z-10">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                    Crear nuevo proyecto
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Vincular repositorios para generar problemas de práctica
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-6">
              {/* Step 1: Conectar repositorios */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                      1
                    </span>
                    Repositorios de origen
                  </label>
                  <span className="text-xs font-medium text-slate-500">
                    {selectedRepos.length} seleccionado(s)
                  </span>
                </div>

                {/* Tabs de Proveedores */}
                <div className="flex rounded-xl border border-slate-700/60 bg-slate-800/40 p-1">
                  {(["github", "gitlab", "bitbucket"] as const).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setActiveProvider(provider)}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all cursor-pointer ${
                        activeProvider === provider
                          ? "bg-slate-700 text-slate-200 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>

                {/* Chips de Repositorios Seleccionados */}
                {selectedRepos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedRepos.map((repo) => (
                      <span
                        key={repo}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs font-mono font-medium text-slate-300"
                      >
                        <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                        {repo}
                        <button
                          type="button"
                          onClick={() => toggleRepo(repo)}
                          className="ml-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          aria-label={`Remove ${repo}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input para filtrar repos */}
                <div className="relative pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filtrar tus repositorios..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomRepo();
                          }
                        }}
                        className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomRepo}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                                {/* Resultados de búsqueda o lista de repos */}
                  {activeProvider === "github" && (
                    <>
                      {/* Manual GitHub username input (shown when auto-detect fails) */}
                      {needsManualUsername && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                          {fetchError && (
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
                              ⚠️ {fetchError}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tu username de GitHub (ej. octocat)"
                              value={githubUsername}
                              onChange={(e) => setGithubUsername(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleFetchByUsername();
                                }
                              }}
                              className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:border-amber-800 dark:bg-neutral-900 dark:text-white transition-all"
                            />
                            <button
                              type="button"
                              onClick={handleFetchByUsername}
                              disabled={!githubUsername.trim()}
                              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-600"
                            >
                              Buscar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Repos list dropdown */}
                      {!needsManualUsername && (
                        <div className="mt-2 w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/80 max-h-52 overflow-y-auto">
                          {isSearching ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                              <span className="ml-2 text-sm text-slate-500">Cargando tus repositorios...</span>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <ul className="divide-y divide-slate-700/40">
                              {searchResults
                                .filter(repo => repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((repo) => {
                                  const isAlreadySelected = selectedRepos.includes(repo.full_name);
                                  return (
                                    <li key={repo.id}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          toggleRepo(repo.full_name);
                                          setSearchQuery("");
                                        }}
                                        className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between cursor-pointer min-h-[44px] ${
                                          isAlreadySelected ? "bg-emerald-500/5" : "hover:bg-slate-700/40"
                                        }`}
                                      >
                                        <div className="min-w-0">
                                          <div className="font-mono text-sm font-medium text-slate-200 truncate">
                                            {repo.full_name}
                                          </div>
                                          {repo.description && (
                                            <div className="text-xs text-slate-500 truncate mt-0.5">
                                              {repo.description}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0 ml-3">
                                          {repo.language && (
                                            <span className="px-2 py-0.5 bg-slate-700/60 rounded-md text-slate-400">
                                              {repo.language}
                                            </span>
                                          )}
                                          {isAlreadySelected && (
                                            <Check className="h-4 w-4 text-emerald-400" />
                                          )}
                                        </div>
                                      </button>
                                    </li>
                                  );
                                })}
                            </ul>
                          ) : (
                            <div className="p-4 text-sm text-slate-500 text-center">
                              No se encontraron repositorios públicos.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Step 2: Configurar proyecto y Battle Stack */}
              <div className="space-y-4 border-t border-slate-800/60 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    2
                  </span>
                  Configuración del proyecto
                </label>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400">
                      Nombre del proyecto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. API de Usuarios & Autenticación"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400">
                      Descripción corta <span className="text-slate-600">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Microservicio de autenticación y transacciones"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400">
                      Tecnologías objetivo (Battle Stack)
                    </label>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {AVAILABLE_TECHS.map((tech) => {
                        const isSelected = selectedTechs.includes(tech.name);
                        return (
                          <button
                            key={tech.name}
                            type="button"
                            onClick={() => toggleTech(tech.name)}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer min-h-[40px] ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                : "border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300"
                            }`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${tech.color}`} />
                            <span>{tech.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
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
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 disabled:opacity-40 disabled:hover:bg-emerald-500 cursor-pointer"
              >
                <Sparkles className="h-5 w-5" />
                <span>Generar Proyecto & Problemas</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
