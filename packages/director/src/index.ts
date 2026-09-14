import type { DirectorDecision, LearningSessionContext } from "@explainara/shared";
import { prerequisites } from "@explainara/knowledge";

export function decideNextAction(context: LearningSessionContext): DirectorDecision {
  const current = context.twin.concepts[context.conceptId];
  const mastery = current?.mastery ?? 0.2;
  const misconceptions = current?.misconceptions.filter((m) => !m.resolved) ?? [];
  const prereqs = prerequisites(context.graph, context.conceptId);
  const weakPrereq = prereqs.find((p) => (context.twin.concepts[p.id]?.mastery ?? 0) < 0.55);
  const lastEvidence = context.recentEvidence.at(-1);
  const recentFailures = context.recentEvidence.slice(-3).filter((e) => e.score < 0.5).length;

  if (weakPrereq) {
    return {
      action: "REVISIT_PREREQUISITE",
      reason: `A prerequisite (${weakPrereq.title}) is below the required mastery threshold.`,
      targetConceptId: weakPrereq.id,
      payload: { resumeConceptId: context.conceptId },
      confidence: 0.95
    };
  }

  if (misconceptions.length) {
    return {
      action: "GENERATE_SIMULATION",
      reason: `An unresolved misconception (${misconceptions[0]?.label}) needs observable counter-evidence.`,
      targetConceptId: context.conceptId,
      payload: { misconceptionId: misconceptions[0]?.id, mode: "counterexample" },
      confidence: 0.91
    };
  }

  if (recentFailures >= 2) {
    return {
      action: "CHANGE_EXPLANATION",
      reason: "Repeated low-scoring evidence indicates the current explanation strategy is not working.",
      targetConceptId: context.conceptId,
      payload: { strategy: "example-first" },
      confidence: 0.88
    };
  }

  if (lastEvidence?.type === "conversation" && lastEvidence.score < 0.6) {
    return {
      action: "SOCRATIC_DIALOGUE",
      reason: "The learner has partial understanding. Guided questions can expose the missing reasoning step.",
      targetConceptId: context.conceptId,
      confidence: 0.78
    };
  }

  if (mastery < 0.45) {
    return {
      action: "SHOW_VISUAL",
      reason: "Low initial mastery. Add a concrete visual model before increasing abstraction.",
      targetConceptId: context.conceptId,
      confidence: 0.8
    };
  }

  if (mastery < 0.68) {
    return {
      action: "GENERATE_SIMULATION",
      reason: "The learner understands basics but needs application evidence.",
      targetConceptId: context.conceptId,
      confidence: 0.82
    };
  }

  if (mastery < 0.82) {
    return {
      action: "TEACH_BACK",
      reason: "Teach-back will verify that the learner can explain the concept, not only recognize it.",
      targetConceptId: context.conceptId,
      confidence: 0.84
    };
  }

  if (current && current.retentionStrength < 0.5) {
    return {
      action: "SCHEDULE_REVIEW",
      reason: "Mastery is good but retention strength is fragile.",
      targetConceptId: context.conceptId,
      confidence: 0.74
    };
  }

  return {
    action: "CONTINUE",
    reason: "Current evidence supports progression to the next unlocked concept.",
    targetConceptId: context.conceptId,
    confidence: 0.86
  };
}

export function explainDecision(decision: DirectorDecision): string {
  const labels: Record<DirectorDecision["action"], string> = {
    CONTINUE: "Continue",
    EXPLAIN_AGAIN: "Explain again",
    CHANGE_EXPLANATION: "Switch explanation strategy",
    SHOW_VISUAL: "Show a visual model",
    SHOW_EXAMPLE: "Show another example",
    ASK_QUESTION: "Ask a check question",
    SOCRATIC_DIALOGUE: "Start Socratic dialogue",
    GENERATE_SIMULATION: "Open an interactive simulation",
    START_QUIZ: "Run a mastery check",
    START_DEBATE: "Start a debate",
    START_ROLEPLAY: "Start a roleplay",
    OPEN_WHITEBOARD: "Open the whiteboard",
    TEACH_BACK: "Ask the learner to teach it back",
    REVISIT_PREREQUISITE: "Review a prerequisite",
    GENERATE_PROJECT: "Create an applied project",
    SKIP_CONCEPT: "Skip this mastered concept",
    INCREASE_DIFFICULTY: "Increase difficulty",
    DECREASE_DIFFICULTY: "Decrease difficulty",
    SCHEDULE_REVIEW: "Schedule a retention review"
  };
  return `${labels[decision.action]}. ${decision.reason}`;
}
