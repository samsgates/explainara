import type { LearnerConceptState, LearningEvidence, MasteryDimensions, Misconception } from "@explainara/shared";
import { clamp01 } from "@explainara/shared";

const TYPE_WEIGHT: Record<LearningEvidence["type"], number> = {
  quiz: 0.9,
  teach_back: 1.15,
  simulation: 1.0,
  project: 1.2,
  conversation: 0.6,
  coding: 1.15,
  scenario: 1.05,
  review: 0.85
};

const defaultDimensions = (): MasteryDimensions => ({
  recall: 0.25,
  understanding: 0.25,
  application: 0.2,
  explanation: 0.2,
  problemSolving: 0.2
});

export function emptyConceptState(conceptId: string): LearnerConceptState {
  return {
    conceptId,
    mastery: 0.2,
    confidence: 0.3,
    dimensions: defaultDimensions(),
    retentionStrength: 0.25,
    forgettingRate: 0.06,
    evidenceCount: 0,
    misconceptions: []
  };
}

export function applyEvidence(
  current: LearnerConceptState,
  evidence: LearningEvidence
): LearnerConceptState {
  const weight = TYPE_WEIGHT[evidence.type] ?? 1;
  const recencyAlpha = Math.min(0.42, 0.12 + weight * 0.14);
  const confidence = evidence.confidence ?? current.confidence;
  const confidenceCalibration = evidence.score >= 0.7 ? confidence : 1 - confidence * 0.35;
  const adjustedScore = clamp01(evidence.score * 0.9 + confidenceCalibration * 0.1);
  const mastery = clamp01(current.mastery * (1 - recencyAlpha) + adjustedScore * recencyAlpha);

  const dimensions = { ...current.dimensions };
  if (evidence.dimensions) {
    for (const key of Object.keys(evidence.dimensions) as Array<keyof MasteryDimensions>) {
      const score = evidence.dimensions[key];
      if (typeof score === "number") dimensions[key] = clamp01(dimensions[key] * 0.72 + score * 0.28);
    }
  } else {
    const map: Partial<Record<LearningEvidence["type"], keyof MasteryDimensions>> = {
      quiz: "recall",
      teach_back: "explanation",
      simulation: "application",
      project: "problemSolving",
      coding: "problemSolving",
      scenario: "application",
      conversation: "understanding",
      review: "recall"
    };
    const dimension = map[evidence.type];
    if (dimension) dimensions[dimension] = clamp01(dimensions[dimension] * 0.75 + evidence.score * 0.25);
  }

  const successful = evidence.score >= 0.7;
  const retentionStrength = clamp01(current.retentionStrength + (successful ? 0.06 : 0.015) * weight);
  const forgettingRate = clamp01(current.forgettingRate * (successful ? 0.97 : 1.01));

  return {
    ...current,
    mastery,
    confidence: clamp01(current.confidence * 0.8 + confidence * 0.2),
    dimensions,
    retentionStrength,
    forgettingRate,
    lastReviewedAt: evidence.createdAt,
    evidenceCount: current.evidenceCount + 1
  };
}

export function aggregateMastery(evidence: LearningEvidence[], seed?: LearnerConceptState): LearnerConceptState {
  const conceptId = evidence[0]?.conceptId ?? seed?.conceptId ?? "unknown";
  return evidence
    .slice()
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .reduce((state, item) => applyEvidence(state, item), seed ?? emptyConceptState(conceptId));
}

export function detectMisconception(params: {
  conceptId: string;
  responseText: string;
  score: number;
  confidence?: number;
  knownPatterns?: Array<{ label: string; pattern: RegExp; explanation: string }>;
}): Misconception | null {
  const { conceptId, responseText, score, confidence = 0.5 } = params;
  const patterns = params.knownPatterns ?? [
    {
      label: "learning-rate-equals-compute",
      pattern: /(learning rate).*(compute|processing|processor|more data|throughput)/i,
      explanation: "Learning rate controls optimization step size, not hardware throughput."
    },
    {
      label: "nat-modifies-payload",
      pattern: /(nat).*(payload|body|content).*(change|modify|rewrite)/i,
      explanation: "NAT normally rewrites addressing/port metadata rather than application payloads."
    }
  ];
  if (score > 0.55 || confidence < 0.65) return null;
  const hit = patterns.find((p) => p.pattern.test(responseText));
  if (!hit) return null;
  const now = new Date();
  return {
    id: `${conceptId}:${hit.label}`,
    conceptId,
    label: hit.label,
    explanation: hit.explanation,
    confidence: clamp01(0.65 + confidence * 0.3),
    frequency: 1,
    resolved: false,
    firstDetectedAt: now,
    lastDetectedAt: now
  };
}

export function mergeMisconception(existing: Misconception[], incoming: Misconception): Misconception[] {
  const index = existing.findIndex((m) => m.id === incoming.id);
  if (index < 0) return [...existing, incoming];
  return existing.map((m, i) =>
    i === index
      ? {
          ...m,
          confidence: Math.max(m.confidence, incoming.confidence),
          frequency: m.frequency + 1,
          lastDetectedAt: incoming.lastDetectedAt,
          resolved: false
        }
      : m
  );
}
