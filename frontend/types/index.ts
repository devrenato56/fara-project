export type Plan = "npc" | "giga_chad";

export interface Organization {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  technologies: string[];
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  difficulty: "easy" | "medium" | "hard";
  transferableConcepts: string[];
  newConcepts: string[];
  adaptableTo: string[];
}
