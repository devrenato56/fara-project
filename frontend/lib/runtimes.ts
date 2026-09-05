// Runtimes instalados en la instancia de Piston autohospedada.
export const RUNTIME_VERSIONS: Record<string, string> = {
  go: "1.16.2",
  python: "3.10.0",
  javascript: "20.11.1",
};

const TECH_TO_LANGUAGE: Record<string, string> = {
  go: "go",
  golang: "go",
  python: "python",
  javascript: "javascript",
  typescript: "javascript",
  node: "javascript",
  "node.js": "javascript",
};

// Una tecnologia del proyecto (ej. "Go") al lenguaje ejecutable en Piston.
// Las que no son runtimes por si mismas (Docker, PostgreSQL) caen a Python.
export function technologyToRuntime(technology: string): string {
  return TECH_TO_LANGUAGE[technology.toLowerCase()] ?? "python";
}

export function versionFor(language: string): string {
  return RUNTIME_VERSIONS[language] ?? RUNTIME_VERSIONS.python;
}
