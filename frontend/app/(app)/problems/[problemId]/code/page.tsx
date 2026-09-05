"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Send,
  FileCode,
  Swords,
} from "lucide-react";
import { CodeEditor } from "@/components/code-editor/CodeEditor";
import { ResultCard } from "@/components/common/ResultCard";
import { LoadingState } from "@/components/common/LoadingState";
import { useApp } from "@/context/AppContext";
import { apiClient } from "@/lib/api-client";
import { mapProblem } from "@/lib/mappers";

const RUNTIME_VERSIONS: Record<string, string> = {
  go: "1.16.2",
  python: "3.10.0",
  javascript: "20.11.1",
};

export default function ProblemCodeModePage() {
  const params = useParams();
  const router = useRouter();
  const problemId = (params?.problemId as string) || "prob-1";
  const { getProblem, getProject } = useApp();

  const [fetchedProblem, setFetchedProblem] = useState<ReturnType<typeof mapProblem> | null>(null);
  useEffect(() => {
    apiClient
      .get<any>(`/problems/${problemId}`)
      .then((data) => setFetchedProblem(mapProblem(data)))
      .catch(() => {});
  }, [problemId]);

  const problem = fetchedProblem || getProblem(problemId) || {
    id: problemId,
    projectId: "proj-1",
    title: "Autenticación JWT",
    description:
      "Construye un middleware de verificación JWT en Gin que extraiga el token Bearer del header Authorization, valide la firma HS256 y monte los claims en el contexto.",
    targetObjective:
      "Implementar el endpoint de login y middleware JWT en Go usando el framework Gin.",
    requirements: [
      "Verificar credenciales contra base de datos simulada",
      "Generar JWT token firmado con clave secreta",
      "Retornar token en respuesta JSON",
      "Manejar errores de parsing retornando HTTP 401",
    ],
    transferableConcepts: [
      "Estructura del token JWT",
      "Flujo de validación en middleware HTTP",
      "Códigos de estado HTTP 401",
    ],
    newConcepts: [
      "gin.HandlerFunc y c.Next()",
      "golang-jwt/jwt/v5 para parsing de claims",
      "Punteros y structs en Go",
    ],
    adaptableTo: ["Go", "Docker"],
    starterCode: {
      go: `package main

import (
\t"net/http"
\t"strings"
\t"github.com/gin-gonic/gin"
)

// AuthMiddleware valida el token JWT del header
func AuthMiddleware() gin.HandlerFunc {
\treturn func(c *gin.Context) {
\t\tauthHeader := c.GetHeader("Authorization")
\t\tif authHeader == "" {
\t\t\tc.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
\t\t\treturn
\t\t}

\t\tparts := strings.Split(authHeader, " ")
\t\tif len(parts) != 2 || parts[0] != "Bearer" {
\t\t\tc.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid format"})
\t\t\treturn
\t\t}

\t\t// Implementa la validacion del token aqui
\t\tc.Next()
\t}
}

func main() {
\tr := gin.Default()
\tr.Use(AuthMiddleware())
\tr.GET("/profile", func(c *gin.Context) {
\t\tc.JSON(http.StatusOK, gin.H{"status": "ok"})
\t})
\tr.Run(":8080")
}`,
    },
  };

  const project = getProject(problem.projectId) || {
    id: problem.projectId,
    name: "API de Tareas",
  };

  const [activeTab, setActiveTab] = useState<"desc" | "material" | "code">("desc");
  const [language, setLanguage] = useState("go");
  const [code, setCode] = useState(
    problem.starterCode?.go || "// Escribe tu código aquí...\n"
  );
  const [status, setStatus] = useState<"editing" | "evaluating" | "result">("editing");
  const [result, setResult] = useState<{ score: number; feedback: string; status: string } | null>(null);

  const handleSendSolution = async () => {
    setStatus("evaluating");
    try {
      const submission = await apiClient.post<any>(`/problems/${problem.id}/submissions`, {
        code,
        language,
        version: RUNTIME_VERSIONS[language] ?? RUNTIME_VERSIONS.go,
      });
      setResult({ score: submission.score, feedback: submission.feedback, status: submission.status });
    } catch {
      setResult({ score: 0, feedback: "No se pudo evaluar el envío. Intenta de nuevo.", status: "failed" });
    }
    setStatus("result");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <Link href="/projects" className="hover:text-neutral-900 dark:hover:text-white">
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/projects/${project.id}`}
          className="hover:text-neutral-900 dark:hover:text-white"
        >
          {project.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-neutral-900 dark:text-white">{problem.title}</span>
      </nav>

      {/* Tabs Superiores y Acciones */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={() => setActiveTab("desc")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "desc"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Descripción
          </button>
          <button
            onClick={() => setActiveTab("material")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "material"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Tu material (GitHub)
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "code"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Code Mode
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/problems/${problem.id}/fight`}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <Swords className="h-4 w-4 text-amber-500" />
            Switch to fight mode
          </Link>

          {status === "editing" && (
            <button
              onClick={handleSendSolution}
              className="flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar solución
            </button>
          )}
        </div>
      </div>

      {/* Pantalla según estado */}
      {status === "evaluating" ? (
        <LoadingState
          title="Evaluando tu solución..."
          subtitle="Ejecutando código en Piston y analizando cumplimiento de requisitos con el Agente Evaluador."
          targetPercent={95}
          durationMs={3000}
        />
      ) : status === "result" && result ? (
        <ResultCard
          mode="solo"
          outcome={result.status === "passed" ? "won" : "lost"}
          userScore={result.score}
          userFeedback={result.feedback}
          onRetry={() => setStatus("editing")}
          onNextProblem={() => router.push(`/projects/${project.id}`)}
          onViewSolution={() => setStatus("editing")}
          projectId={project.id}
          problemId={problem.id}
        />
      ) : (
        /* Modo Edición en 2 Columnas */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna Izquierda: Enunciado y Requisitos (5 cols) */}
          <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-5">
            <div>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-mono font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Ejercicio Práctico
              </span>
              <h2 className="mt-2 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                {problem.title}
              </h2>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Tu objetivo
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {problem.targetObjective || problem.description}
              </p>
            </div>

            {problem.requirements && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Requisitos
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {problem.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-neutral-400">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conceptos Transferibles vs Nuevos */}
            <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Puente Conceptual
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
                    💡 Conceptos Transferibles (Ya los dominas)
                  </div>
                  <ul className="mt-1 space-y-1 text-xs text-blue-900 dark:text-blue-200">
                    {problem.transferableConcepts.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 dark:border-purple-900/40 dark:bg-purple-950/20">
                  <div className="text-xs font-bold text-purple-800 dark:text-purple-300">
                    🚀 Conceptos Nuevos (Enfócate aquí)
                  </div>
                  <ul className="mt-1 space-y-1 text-xs text-purple-900 dark:text-purple-200">
                    {problem.newConcepts.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Editor Monaco (7 cols) */}
          <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-7">
            {/* Header del Editor */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-neutral-400" />
                <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  main.go
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Runtime:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-xs font-semibold text-neutral-800 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <option value="go">Go 1.16</option>
                  <option value="python">Python 3.10</option>
                  <option value="javascript">JavaScript (Node 20)</option>
                </select>
              </div>
            </div>

            {/* Monaco Editor Wrapper */}
            <div className="mt-3 flex-1 min-h-[460px]">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                height="460px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
