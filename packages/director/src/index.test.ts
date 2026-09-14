import { describe, expect, it } from "vitest";
import { decideNextAction } from "./index";
import { demoKubernetesGraph } from "@explainara/knowledge";
import { createLearnerTwin } from "@explainara/learner";

describe("adaptive director", () => {
  it("returns a pedagogical action", () => {
    const twin = createLearnerTwin("u1", "t1");
    const conceptId = demoKubernetesGraph.nodes[0]!.id;
    const decision = decideNextAction({
      tenantId: "t1",
      learnerId: "u1",
      classroomId: "c1",
      courseId: "course-k8s",
      conceptId,
      twin,
      graph: demoKubernetesGraph,
      recentEvidence: [],
      recentEvents: []
    });
    expect(decision.action).toBe("SHOW_VISUAL");
  });
});
