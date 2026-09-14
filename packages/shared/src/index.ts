import { z } from "zod";

export const RoleSchema = z.enum(["platform_admin", "organization_admin", "teacher", "creator", "student"]);
export type Role = z.infer<typeof RoleSchema>;

export const MasteryDimensionSchema = z.object({
  recall: z.number().min(0).max(1),
  understanding: z.number().min(0).max(1),
  application: z.number().min(0).max(1),
  explanation: z.number().min(0).max(1),
  problemSolving: z.number().min(0).max(1)
});
export type MasteryDimensions = z.infer<typeof MasteryDimensionSchema>;

export const EvidenceTypeSchema = z.enum([
  "quiz",
  "teach_back",
  "simulation",
  "project",
  "conversation",
  "coding",
  "scenario",
  "review"
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const LearningEvidenceSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  learnerId: z.string(),
  type: EvidenceTypeSchema,
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1).optional(),
  dimensions: MasteryDimensionSchema.partial().optional(),
  latencyMs: z.number().nonnegative().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.coerce.date()
});
export type LearningEvidence = z.infer<typeof LearningEvidenceSchema>;

export const ConceptNodeSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().default(""),
  difficulty: z.number().min(0).max(1).default(0.5),
  estimatedMinutes: z.number().int().positive().default(15),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({})
});
export type ConceptNode = z.infer<typeof ConceptNodeSchema>;

export const ConceptEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relation: z.enum(["prerequisite", "related", "part_of", "contrasts", "applies"]),
  weight: z.number().min(0).max(1).default(1)
});
export type ConceptEdge = z.infer<typeof ConceptEdgeSchema>;

export type KnowledgeGraph = {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
};

export type Misconception = {
  id: string;
  conceptId: string;
  label: string;
  explanation: string;
  confidence: number;
  frequency: number;
  resolved: boolean;
  firstDetectedAt: Date;
  lastDetectedAt: Date;
};

export type LearnerConceptState = {
  conceptId: string;
  mastery: number;
  confidence: number;
  dimensions: MasteryDimensions;
  retentionStrength: number;
  forgettingRate: number;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  evidenceCount: number;
  misconceptions: Misconception[];
};

export type LearnerDigitalTwin = {
  learnerId: string;
  tenantId: string;
  goals: string[];
  strengths: string[];
  weaknesses: string[];
  behavioralSignals: string[];
  preferredExplanationPatterns: string[];
  pace: "slow" | "balanced" | "fast";
  engagement: number;
  concepts: Record<string, LearnerConceptState>;
  updatedAt: Date;
};

export const DirectorActionSchema = z.enum([
  "CONTINUE",
  "EXPLAIN_AGAIN",
  "CHANGE_EXPLANATION",
  "SHOW_VISUAL",
  "SHOW_EXAMPLE",
  "ASK_QUESTION",
  "SOCRATIC_DIALOGUE",
  "GENERATE_SIMULATION",
  "START_QUIZ",
  "START_DEBATE",
  "START_ROLEPLAY",
  "OPEN_WHITEBOARD",
  "TEACH_BACK",
  "REVISIT_PREREQUISITE",
  "GENERATE_PROJECT",
  "SKIP_CONCEPT",
  "INCREASE_DIFFICULTY",
  "DECREASE_DIFFICULTY",
  "SCHEDULE_REVIEW"
]);
export type DirectorAction = z.infer<typeof DirectorActionSchema>;

export type DirectorDecision = {
  action: DirectorAction;
  reason: string;
  targetConceptId: string;
  payload?: Record<string, unknown>;
  confidence: number;
};

export type TeachingSkill = {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  systemPrompt: string;
  compatibleActions: DirectorAction[];
};

export type ClassroomEvent = {
  id: string;
  tenantId: string;
  learnerId: string;
  classroomId: string;
  type:
    | "lesson_started"
    | "lesson_completed"
    | "question_asked"
    | "quiz_answered"
    | "simulation_changed"
    | "misconception_detected"
    | "mastery_updated"
    | "teacher_intervention"
    | "roleplay_action"
    | "project_submitted"
    | "presence";
  conceptId?: string;
  payload: Record<string, unknown>;
  createdAt: Date;
};

export type CourseDraft = {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  goal: string;
  sourceType: "topic" | "text" | "document" | "website" | "youtube" | "github" | "paper";
  sourceUri?: string;
  modules: Array<{
    id: string;
    title: string;
    objective: string;
    conceptIds: string[];
  }>;
  graph: KnowledgeGraph;
};

export type LearningSessionContext = {
  tenantId: string;
  learnerId: string;
  classroomId: string;
  courseId: string;
  conceptId: string;
  twin: LearnerDigitalTwin;
  graph: KnowledgeGraph;
  recentEvidence: LearningEvidence[];
  recentEvents: ClassroomEvent[];
  userMessage?: string;
};

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export const iso = (date?: Date) => date?.toISOString();
