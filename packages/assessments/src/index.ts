import type { EvidenceType, LearningEvidence, MasteryDimensions } from "@explainara/shared";
import { detectMisconception } from "@explainara/mastery";

export type AssessmentRubric = {
  expectedKeywords?: string[];
  requiredIdeas?: string[];
  misconceptions?: Array<{ label: string; pattern: RegExp; explanation: string }>;
};

export function evaluateText(params: {
  learnerId: string;
  conceptId: string;
  answer: string;
  confidence?: number;
  type?: EvidenceType;
  rubric: AssessmentRubric;
}): { evidence: LearningEvidence; feedback: string; misconception: ReturnType<typeof detectMisconception> } {
  const answer = params.answer.toLowerCase();
  const keywords = params.rubric.expectedKeywords ?? [];
  const ideas = params.rubric.requiredIdeas ?? [];
  const keywordScore = keywords.length ? keywords.filter((k) => answer.includes(k.toLowerCase())).length / keywords.length : 0.75;
  const ideaScore = ideas.length ? ideas.filter((k) => answer.includes(k.toLowerCase())).length / ideas.length : keywordScore;
  const score = Math.max(0, Math.min(1, keywordScore * 0.45 + ideaScore * 0.55));
  const dimensions: Partial<MasteryDimensions> = params.type === "teach_back"
    ? { explanation: score, understanding: score }
    : { recall: score, understanding: score };
  const evidence: LearningEvidence = {
    id: crypto.randomUUID(),
    learnerId: params.learnerId,
    conceptId: params.conceptId,
    type: params.type ?? "quiz",
    score,
    confidence: params.confidence,
    dimensions,
    metadata: { answer: params.answer },
    createdAt: new Date()
  };
  const misconception = detectMisconception({
    conceptId: params.conceptId,
    responseText: params.answer,
    score,
    confidence: params.confidence,
    knownPatterns: params.rubric.misconceptions
  });
  return {
    evidence,
    misconception,
    feedback: score >= 0.8 ? "Strong answer. You included the key reasoning." : score >= 0.55 ? "Partially correct. Add the missing causal link and an example." : "The answer needs remediation. Review the underlying mechanism before retrying."
  };
}
