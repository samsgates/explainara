import { describe, expect, it } from "vitest";
import { applyEvidence, detectMisconception, emptyConceptState } from "./index";

describe("mastery engine", () => {
  it("increases mastery from strong teach-back evidence", () => {
    const before = emptyConceptState("gradient");
    const after = applyEvidence(before, {
      id: "e1",
      conceptId: "gradient",
      learnerId: "u1",
      type: "teach_back",
      score: 0.95,
      confidence: 0.9,
      dimensions: { explanation: 0.96, understanding: 0.9 },
      metadata: {},
      createdAt: new Date()
    });
    expect(after.mastery).toBeGreaterThan(before.mastery);
    expect(after.dimensions.explanation).toBeGreaterThan(before.dimensions.explanation);
  });

  it("detects high confidence misconception", () => {
    const hit = detectMisconception({
      conceptId: "lr",
      responseText: "The learning rate makes the processor handle more data, so compute is faster.",
      score: 0.2,
      confidence: 0.95
    });
    expect(hit?.label).toBe("learning-rate-equals-compute");
  });
});
