import type { LearnerConceptState } from "@explainara/shared";

export function retentionAt(state: LearnerConceptState, now = new Date()): number {
  if (!state.lastReviewedAt) return state.retentionStrength;
  const days = Math.max(0, (now.getTime() - state.lastReviewedAt.getTime()) / 86_400_000);
  const decay = Math.exp(-state.forgettingRate * days / Math.max(0.15, state.retentionStrength));
  return Math.max(0, Math.min(1, state.mastery * decay));
}

export function nextReviewDate(state: LearnerConceptState, from = new Date(), targetRetention = 0.68): Date {
  const mastery = Math.max(0.01, state.mastery);
  const rate = Math.max(0.005, state.forgettingRate);
  const strength = Math.max(0.15, state.retentionStrength);
  const days = Math.max(1, (-Math.log(targetRetention / mastery) * strength) / rate);
  return new Date(from.getTime() + Math.min(90, days) * 86_400_000);
}

export function reviewsDue(states: LearnerConceptState[], now = new Date()) {
  return states
    .map((state) => ({ state, retention: retentionAt(state, now), due: state.nextReviewAt ?? nextReviewDate(state, state.lastReviewedAt ?? now) }))
    .filter((item) => item.due <= now || item.retention < 0.62)
    .sort((a, b) => a.retention - b.retention);
}
