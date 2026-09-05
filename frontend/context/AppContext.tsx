"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Organization, Project, Problem, Plan } from "@/types";
import { supabase } from "@/lib/supabase-client";
import { apiClient } from "@/lib/api-client";
import { mapOrganization, mapProject, mapProblem, fetchProjectMembers } from "@/lib/mappers";

interface AppContextType {
  user: User;
  currentOrg: Organization;
  organizations: Organization[];
  projects: Project[];
  switchOrg: (orgId: string) => void;
  createOrg: (name: string) => Promise<Organization>;
  createProject: (data: {
    name: string;
    description?: string;
    repositories: string[];
    technologies: string[];
  }) => Promise<Project>;
  getProject: (id: string) => Project | undefined;
  fetchProject: (id: string) => Promise<void>;
  getProblems: (projectId: string) => Problem[];
  getProblem: (problemId: string) => Problem | undefined;
  setPlan: (plan: Plan) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/login"];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [problemsMap, setProblemsMap] = useState<Record<string, Problem[]>>({});

  // Sesion de Supabase Auth -> perfil publico (public.users)
  useEffect(() => {
    const loadUser = async (authUser: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]> | null) => {
      if (!authUser) {
        setUser(null);
        setAuthChecked(true);
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("username, avatar_url, streak_days, plan")
        .eq("id", authUser.id)
        .single();

      setUser({
        id: authUser.id,
        username: profile?.username ?? authUser.email?.split("@")[0] ?? "usuario",
        email: authUser.email ?? "",
        avatarUrl: profile?.avatar_url ?? undefined,
        streakDays: profile?.streak_days ?? 0,
        provider: (authUser.app_metadata?.provider as User["provider"]) ?? "github",
        plan: (profile?.plan as Plan) ?? "npc",
      });
      setAuthChecked(true);
    };

    supabase.auth.getUser().then(({ data }) => loadUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Guard minimo: sin sesion, afuera de rutas publicas -> login
  useEffect(() => {
    if (!authChecked) return;
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.push("/login");
    }
  }, [authChecked, user, pathname, router]);

  // Organizaciones del usuario (auto-crea una si no tiene ninguna)
  useEffect(() => {
    if (!user) return;
    (async () => {
      let orgs = (await apiClient.get<any[]>("/organizations")).map(mapOrganization);
      if (orgs.length === 0) {
        const created = mapOrganization(
          await apiClient.post<any>("/organizations", { name: `${user.username}'s org` })
        );
        orgs = [created];
      }
      setOrganizations(orgs);
      setCurrentOrgId((prev) => prev || orgs[0].id);
    })();
  }, [user]);

  const fetchProjects = useCallback(async (orgId: string) => {
    const data = await apiClient.get<any[]>(`/projects?org_id=${orgId}`);
    setProjects(data.map((p) => mapProject(p)));
  }, []);

  useEffect(() => {
    if (currentOrgId) fetchProjects(currentOrgId);
  }, [currentOrgId, fetchProjects]);

  const currentOrg =
    organizations.find((o) => o.id === currentOrgId) || organizations[0] || { id: "", name: "..." };

  const switchOrg = (orgId: string) => setCurrentOrgId(orgId);

  const createOrg = async (name: string): Promise<Organization> => {
    const created = mapOrganization(await apiClient.post<any>("/organizations", { name }));
    setOrganizations((prev) => [...prev, created]);
    setCurrentOrgId(created.id);
    return created;
  };

  const createProject = async (data: {
    name: string;
    description?: string;
    repositories: string[];
    technologies: string[];
  }): Promise<Project> => {
    const created = mapProject(
      await apiClient.post<any>("/projects", {
        org_id: currentOrg.id,
        name: data.name,
        description: data.description || null,
        repos: data.repositories,
        technologies: data.technologies,
      })
    );
    setProjects((prev) => [created, ...prev]);
    // Dispara la generacion en background; el modal escucha el canal Realtime.
    apiClient.post(`/projects/${created.id}/generate-problems`).catch(() => {});
    return created;
  };

  const fetchProject = async (id: string) => {
    const detail = await apiClient.get<any>(`/projects/${id}`);
    const problems = (detail.problems ?? []).map(mapProblem);
    const members = await fetchProjectMembers(id);
    const project = { ...mapProject(detail, problems), members };

    setProjects((prev) => {
      const exists = prev.some((p) => p.id === id);
      return exists ? prev.map((p) => (p.id === id ? project : p)) : [...prev, project];
    });
    setProblemsMap((prev) => ({ ...prev, [id]: problems }));
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const getProblems = (projectId: string) => problemsMap[projectId] || [];

  const getProblem = (problemId: string) => {
    for (const list of Object.values(problemsMap)) {
      const found = list.find((p) => p.id === problemId);
      if (found) return found;
    }
    return undefined;
  };

  const setPlan = (plan: Plan) => {
    if (user) setUser({ ...user, plan });
  };

  if (!authChecked || (!user && !PUBLIC_PATHS.includes(pathname))) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        user: user ?? ({} as User),
        currentOrg,
        organizations,
        projects,
        switchOrg,
        createOrg,
        createProject,
        getProject,
        fetchProject,
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
