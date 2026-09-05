"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  Organization,
  Project,
  Problem,
  Plan,
} from "@/types";
import {
  MOCK_USER,
  MOCK_ORGANIZATIONS,
  MOCK_PROJECTS,
  MOCK_PROBLEMS,
} from "@/lib/mock-data";

interface AppContextType {
  user: User;
  currentOrg: Organization;
  organizations: Organization[];
  projects: Project[];
  switchOrg: (orgId: string) => void;
  createOrg: (name: string) => Organization;
  createProject: (data: {
    name: string;
    description?: string;
    repositories: string[];
    technologies: string[];
  }) => Promise<Project>;
  getProject: (id: string) => Project | undefined;
  getProblems: (projectId: string) => Problem[];
  getProblem: (problemId: string) => Problem | undefined;
  setPlan: (plan: Plan) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPlan = localStorage.getItem("fara_user_plan") as Plan;
        if (savedPlan) return { ...MOCK_USER, plan: savedPlan };
      } catch {
        // Ignore
      }
    }
    return MOCK_USER;
  });
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [currentOrgId, setCurrentOrgId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedOrg = localStorage.getItem("fara_current_org");
        if (savedOrg) return savedOrg;
      } catch {
        // Ignore
      }
    }
    return "org-1";
  });
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [problemsMap, setProblemsMap] = useState<Record<string, Problem[]>>(MOCK_PROBLEMS);

  const currentOrg =
    organizations.find((o) => o.id === currentOrgId) || organizations[0];

  const switchOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    try {
      localStorage.setItem("fara_current_org", orgId);
    } catch {
      // Ignore
    }
  };

  const createOrg = (name: string): Organization => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name,
      ownerId: user.id,
    };
    setOrganizations((prev) => [...prev, newOrg]);
    setCurrentOrgId(newOrg.id);
    return newOrg;
  };

  const createProject = async (data: {
    name: string;
    description?: string;
    repositories: string[];
    technologies: string[];
  }): Promise<Project> => {
    // Simular delay de análisis agéntico si se llama desde el frontend
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      orgId: currentOrg.id,
      name: data.name,
      description: data.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: "Recién creado",
      inviteToken: `inv_fara_${Math.random().toString(36).substring(2, 9)}`,
      repositories: data.repositories.map((repo, i) => ({
        id: `repo-${Date.now()}-${i}`,
        fullName: repo,
        url: `https://github.com/${repo}`,
        stars: Math.floor(Math.random() * 50) + 1,
      })),
      technologies: data.technologies,
      members: [
        {
          id: `mem-${Date.now()}`,
          projectId: `proj-${Date.now()}`,
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          isExternal: false,
          joinedAt: new Date().toISOString(),
        },
      ],
      problemsCount: 4,
      completedCount: 0,
      progressPercent: 0,
    };

    // Generar problemas mock adaptados a las tecnologías seleccionadas
    const generatedProblems: Problem[] = [
      {
        id: `prob-${Date.now()}-1`,
        projectId: newProj.id,
        title: `Migración de Servicios en ${data.technologies[0] || "Go"}`,
        description: `Adapta la arquitectura base del repositorio ${data.repositories[0] || "proyecto"} hacia ${data.technologies[0] || "Go"}.`,
        sourceUrl: `https://github.com/${data.repositories[0] || "repo"}/blob/main/service.py`,
        difficulty: "medium",
        status: "pending",
        transferableConcepts: ["Lógica de negocio", "Mapeo de rutas"],
        newConcepts: ["Sintaxis idiomática", "Manejo de errores"],
        adaptableTo: data.technologies,
      },
      {
        id: `prob-${Date.now()}-2`,
        projectId: newProj.id,
        title: `Optimización de consultas y persistencia`,
        description: `Reescribe el acceso a datos aplicando buenas prácticas del nuevo stack.`,
        sourceUrl: `https://github.com/${data.repositories[0] || "repo"}/blob/main/db.py`,
        difficulty: "hard",
        status: "pending",
        transferableConcepts: ["Esquemas relacionales", "Transacciones"],
        newConcepts: ["Connection pooling", "ORM nativo"],
        adaptableTo: data.technologies,
      },
    ];

    setProjects((prev) => [newProj, ...prev]);
    setProblemsMap((prev) => ({
      ...prev,
      [newProj.id]: generatedProblems,
    }));

    return newProj;
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  const getProblems = (projectId: string) => {
    return problemsMap[projectId] || [];
  };

  const getProblem = (problemId: string) => {
    for (const pList of Object.values(problemsMap)) {
      const found = pList.find((p) => p.id === problemId);
      if (found) return found;
    }
    return undefined;
  };

  const setPlan = (plan: Plan) => {
    setUser((prev) => ({ ...prev, plan }));
    try {
      localStorage.setItem("fara_user_plan", plan);
    } catch {
      // Ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentOrg,
        organizations,
        projects: projects.filter((p) => p.orgId === currentOrg.id),
        switchOrg,
        createOrg,
        createProject,
        getProject,
        getProblems,
        getProblem,
        setPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de un AppProvider");
  }
  return context;
}
