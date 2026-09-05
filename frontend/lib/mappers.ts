import { Organization, Problem, ProjectMember, Project } from "@/types";
import { supabase } from "@/lib/supabase-client";

export function mapOrganization(o: any): Organization {
  return { id: o.id, name: o.name, ownerId: o.owner_id };
}

export function mapProblem(p: any): Problem {
  return {
    id: p.id,
    projectId: p.project_id,
    title: p.title,
    description: p.description,
    sourceSnippet: p.source_snippet ?? undefined,
    sourceUrl: p.source_url ?? "",
    difficulty: p.difficulty,
    status: p.status === "proposed" ? "pending" : "pending",
    transferableConcepts: p.transferable_concepts ?? [],
    newConcepts: p.new_concepts ?? [],
    adaptableTo: p.technologies ?? [],
  };
}

export function mapProject(p: any, problems: Problem[] = []): Project {
  return {
    id: p.id,
    orgId: p.org_id,
    name: p.name,
    description: p.description,
    createdAt: p.created_at,
    inviteToken: p.invite_token,
    repositories: (p.repos ?? []).map((fullName: string) => ({
      id: fullName,
      fullName,
      url: `https://github.com/${fullName}`,
      stars: 0,
    })),
    technologies: p.technologies ?? [],
    members: [],
    problemsCount: problems.length,
    completedCount: 0,
    progressPercent: 0,
  };
}

// No hay endpoint dedicado para listar el equipo de un proyecto: se lee
// directo via Supabase, protegido por las mismas RLS policies del backend.
export async function fetchProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data, error } = await supabase
    .from("project_members")
    .select("id, project_id, user_id, is_external, joined_at, users(username, avatar_url)")
    .eq("project_id", projectId);

  if (error || !data) return [];

  return data.map((m: any) => ({
    id: m.id,
    projectId: m.project_id,
    userId: m.user_id,
    username: m.users?.username ?? "Usuario",
    avatarUrl: m.users?.avatar_url ?? undefined,
    isExternal: m.is_external,
    joinedAt: m.joined_at,
  }));
}
