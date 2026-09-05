export type Plan = "npc" | "giga_chad";

export type AuthProvider = "google" | "github" | "phone";

export type Difficulty = "easy" | "medium" | "hard";

export type ProblemStatus = "completed" | "in_progress" | "pending";

export type MatchOpponentType = "ai" | "human";

export type MatchStatus =
  | "waiting_opponent"
  | "in_progress"
  | "reviewing"
  | "finished"
  | "cancelled"
  | "abandoned";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  streakDays: number;
  provider: AuthProvider;
  plan: Plan;
}

export interface Organization {
  id: string;
  name: string;
  ownerId?: string;
}

export interface Membership {
  orgId: string;
  userId: string;
  joinedAt: string;
}

export interface Technology {
  id: string;
  name: string;
  iconName: string;
  isTrending?: boolean;
}

export interface Repository {
  id: string;
  fullName: string;
  url: string;
  stars: number;
  defaultBranch?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  isExternal: boolean;
  joinedAt: string;
}

export interface Problem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  sourceSnippet?: string;
  sourceUrl: string;
  difficulty: Difficulty;
  status: ProblemStatus;
  transferableConcepts: string[];
  newConcepts: string[];
  adaptableTo: string[]; // Lista de nombres de tecnologías: ["Go", "Docker", "Python"]
  starterCode?: Record<string, string>; // Código inicial por lenguaje
  solutionCode?: Record<string, string>;
  targetObjective?: string;
  requirements?: string[];
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt?: string;
  inviteToken?: string;
  repositories: Repository[];
  technologies: string[];
  members: ProjectMember[];
  problemsCount: number;
  completedCount: number;
  progressPercent: number;
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  matchId?: string | null;
  code: string;
  language: string;
  score: number;
  feedback: string;
  status: "passed" | "failed";
  submittedAt: string;
}

export interface AIRunStep {
  timeSec: number;
  code: string;
  description?: string;
  isBuggy?: boolean;
}

export interface Match {
  id: string;
  problemId: string;
  problemTitle: string;
  challengerId: string;
  challengerName: string;
  opponentType: MatchOpponentType;
  opponentUserId?: string;
  opponentName?: string;
  status: MatchStatus;
  durationSec: number;
  startedAt?: string;
  winnerId?: string;
  aiCompletionTimeSec?: number;
  aiRevealScript?: AIRunStep[];
  userScore?: number;
  opponentScore?: number;
  userFeedback?: string;
  opponentFeedback?: string;
}
