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
  { name: "Go", icon: "⚡" },
  { name: "Docker", icon: "🐳" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Redis", icon: "🔴" },
  { name: "Rust", icon: "🦀" },
  { name: "TypeScript", icon: "🟦" },
  { name: "Python", icon: "🐍" },
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
  const { createProject } = useApp();

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

  // Debounce search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await apiClient.get<GitHubRepo[]>(`/github/search?q=${searchQuery}`);
        setSearchResults(results);
      } catch (e) {
        console.error("Failed to search GitHub repos", e);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      setSearchResults([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] border border-white/20 bg-white/90 p-5 sm:p-8 shadow-2xl transition-all dark:border-neutral-700/50 dark:bg-neutral-900/90 shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.6)]">
        
        {/* Glow ambient background effect */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-amber-500/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-[80px]" />

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
            <div className="flex items-start justify-between border-b border-neutral-200/60 pb-4 sm:pb-6 dark:border-neutral-800/60">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 text-white shadow-lg dark:from-neutral-100 dark:to-neutral-300 dark:text-neutral-900">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                    Crear nuevo proyecto
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Vincular repositorios para generar problemas de práctica
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8">
              {/* Step 1: Conectar repositorios */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-black text-white shadow-sm dark:bg-white dark:text-neutral-900">
                      1
                    </span>
                    Repositorios de Origen
                  </label>
                  <span className="text-xs font-bold text-neutral-400">
                    {selectedRepos.length} seleccionado(s)
                  </span>
                </div>

                {/* Tabs de Proveedores */}
                <div className="flex rounded-xl border border-neutral-200/80 bg-neutral-100/60 p-1.5 shadow-inner dark:border-neutral-800/80 dark:bg-neutral-950/60">
                  {(["github", "gitlab", "bitbucket"] as const).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setActiveProvider(provider)}
                      className={`flex-1 rounded-lg py-2 text-sm font-bold capitalize transition-all duration-300 ${
                        activeProvider === provider
                          ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:text-white dark:ring-white/10"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>

                {/* Chips de Repositorios Seleccionados */}
                {selectedRepos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedRepos.map((repo) => (
                      <span
                        key={repo}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        <GitBranch className="h-3.5 w-3.5 text-neutral-400" />
                        {repo}
                        <button
                          type="button"
                          onClick={() => toggleRepo(repo)}
                          className="ml-1 text-neutral-400 hover:text-rose-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input para buscar o agregar repo personalizado */}
                <div className="relative pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Buscar repositorio público o pegar (ej. facebook/react)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomRepo();
                          }
                        }}
                        className="w-full rounded-xl border border-neutral-300 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950/80 dark:text-white dark:focus:border-white dark:focus:ring-white/20 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomRepo}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                  
                  {/* Resultados de búsqueda */}
                  {searchQuery.length >= 2 && activeProvider === "github" && (
                    <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800 max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
                          <span className="ml-2 text-sm text-neutral-500">Buscando...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <ul className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                          {searchResults.map((repo) => (
                            <li key={repo.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  toggleRepo(repo.full_name);
                                  setSearchQuery("");
                                  setSearchResults([]);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                    {repo.full_name}
                                  </div>
                                  {repo.description && (
                                    <div className="text-xs text-neutral-500 truncate mt-1">
                                      {repo.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
                                  {repo.language && (
                                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                      {repo.language}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <span className="text-amber-500">★</span> {repo.stargazers_count}
                                  </span>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-sm text-neutral-500 text-center">
                          No se encontraron repositorios públicos.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Configurar proyecto y Battle Stack */}
              <div className="space-y-5 border-t border-neutral-200/60 pt-6 dark:border-neutral-800/60">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-black text-white shadow-sm dark:bg-white dark:text-neutral-900">
                    2
                  </span>
                  Configuración del Proyecto & Battle Stack
                </label>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      Nombre del proyecto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. API de Usuarios & Autenticación"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white/80 px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950/80 dark:text-white dark:focus:border-white dark:focus:ring-white/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      Descripción corta <span className="text-neutral-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Microservicio de autenticación y transacciones"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white/80 px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950/80 dark:text-white dark:focus:border-white dark:focus:ring-white/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      Tecnologías objetivo a practicar (Battle Stack)
                    </label>
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {AVAILABLE_TECHS.map((tech) => {
                        const isSelected = selectedTechs.includes(tech.name);
                        return (
                          <button
                            key={tech.name}
                            type="button"
                            onClick={() => toggleTech(tech.name)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                              isSelected
                                ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900 scale-105"
                                : "border border-neutral-200 bg-white/80 text-neutral-700 hover:bg-neutral-100 hover:scale-105 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            }`}
                          >
                            <span>{tech.icon}</span>
                            <span>{tech.name}</span>
                            {isSelected && <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />}
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
                className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 py-4 text-base font-extrabold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 dark:from-white dark:to-neutral-200 dark:text-neutral-900"
              >
                <Sparkles className="h-5 w-5 text-amber-400 dark:text-amber-600" />
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
