import type { LearnerDigitalTwin, LearningEvidence, Misconception } from "@explainara/shared";
import { applyEvidence, emptyConceptState, mergeMisconception } from "@explainara/mastery";

export function createLearnerTwin(learnerId: string, tenantId: string): LearnerDigitalTwin {
  return {
    learnerId,
    tenantId,
    goals: [],
    strengths: [],
    weaknesses: [],
    behavioralSignals: [],
    preferredExplanationPatterns: [],
    pace: "balanced",
    engagement: 0.7,
    concepts: {},
    updatedAt: new Date()
  };
}

export function recordEvidence(twin: LearnerDigitalTwin, evidence: LearningEvidence): LearnerDigitalTwin {
  const previous = twin.concepts[evidence.conceptId] ?? emptyConceptState(evidence.conceptId);
  const next = applyEvidence(previous, evidence);
  const concepts = { ...twin.concepts, [evidence.conceptId]: next };
  const ranked = Object.values(concepts).sort((a, b) => b.mastery - a.mastery);
  return {
    ...twin,
    concepts,
    strengths: ranked.filter((c) => c.mastery >= 0.78).slice(0, 5).map((c) => c.conceptId),
    weaknesses: ranked.filter((c) => c.mastery < 0.55).slice(-5).map((c) => c.conceptId),
    updatedAt: new Date()
  };
}

export function recordMisconception(twin: LearnerDigitalTwin, misconception: Misconception): LearnerDigitalTwin {
  const previous = twin.concepts[misconception.conceptId] ?? emptyConceptState(misconception.conceptId);
  return {
    ...twin,
    concepts: {
      ...twin.concepts,
      [misconception.conceptId]: {
        ...previous,
        misconceptions: mergeMisconception(previous.misconceptions, misconception)
      }
    },
    updatedAt: new Date()
  };
}

export function addBehavioralSignal(twin: LearnerDigitalTwin, signal: string): LearnerDigitalTwin {
  const signals = [signal, ...twin.behavioralSignals.filter((s) => s !== signal)].slice(0, 30);
  return { ...twin, behavioralSignals: signals, updatedAt: new Date() };
}

export function summarizeTwin(twin: LearnerDigitalTwin) {
  const concepts = Object.values(twin.concepts);
  const avg = concepts.length ? concepts.reduce((a, c) => a + c.mastery, 0) / concepts.length : 0;
  const unresolved = concepts.flatMap((c) => c.misconceptions).filter((m) => !m.resolved);
  return {
    mastery: avg,
    conceptsTracked: concepts.length,
    unresolvedMisconceptions: unresolved.length,
    strengths: twin.strengths,
    weaknesses: twin.weaknesses,
    engagement: twin.engagement,
    pace: twin.pace
  };
}
