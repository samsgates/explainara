import type { TeachingSkill } from "@explainara/shared";

const builtins: TeachingSkill[] = [
  {
    id: "socratic",
    name: "Socratic Coach",
    description: "Uses progressively targeted questions rather than immediately giving the answer.",
    triggers: ["partial-understanding", "reasoning-gap", "high-confidence-error"],
    systemPrompt: "Ask one concise question at a time. Expose assumptions. Give hints only after evidence of productive struggle.",
    compatibleActions: ["SOCRATIC_DIALOGUE", "ASK_QUESTION", "TEACH_BACK"]
  },
  {
    id: "feynman",
    name: "Feynman Teach-Back",
    description: "Makes the learner explain a concept simply and probes gaps.",
    triggers: ["mastery-0.65", "fragile-understanding"],
    systemPrompt: "Act like an intelligent novice. Ask the learner to explain simply, then challenge one missing causal step.",
    compatibleActions: ["TEACH_BACK", "ASK_QUESTION"]
  },
  {
    id: "example-first",
    name: "Example First",
    description: "Moves from a concrete worked example to the abstract rule.",
    triggers: ["repeated-failure", "abstraction-friction"],
    systemPrompt: "Start with one concrete example, label each transformation, then derive the general rule.",
    compatibleActions: ["CHANGE_EXPLANATION", "SHOW_EXAMPLE", "SHOW_VISUAL"]
  },
  {
    id: "simulation-coach",
    name: "Simulation Coach",
    description: "Turns misconceptions into observable experiments.",
    triggers: ["misconception", "application-gap"],
    systemPrompt: "Create a falsifiable prediction, let the learner manipulate one variable, and ask what evidence changed their model.",
    compatibleActions: ["GENERATE_SIMULATION", "ASK_QUESTION"]
  },
  {
    id: "architecture-review",
    name: "Architecture Review Panel",
    description: "Uses stakeholder roleplay to test systems-thinking tradeoffs.",
    triggers: ["architecture", "enterprise", "tradeoff"],
    systemPrompt: "Alternate CTO, security, finance and operations viewpoints. Require explicit tradeoffs and non-functional requirements.",
    compatibleActions: ["START_ROLEPLAY", "START_DEBATE", "GENERATE_PROJECT"]
  }
];

export class SkillRegistry {
  private readonly skills = new Map<string, TeachingSkill>(builtins.map((s) => [s.id, s]));
  list() { return [...this.skills.values()]; }
  get(id: string) { return this.skills.get(id); }
  register(skill: TeachingSkill) { this.skills.set(skill.id, skill); return this; }
  forAction(action: TeachingSkill["compatibleActions"][number]) { return this.list().filter((s) => s.compatibleActions.includes(action)); }
}

export const skillRegistry = new SkillRegistry();
