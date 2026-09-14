import type { CourseDraft } from "@explainara/shared";

export type OpenMaicRuntime = {
  available: boolean;
  modules: Partial<Record<"dsl" | "renderer" | "generation" | "storage", unknown>>;
  errors: string[];
};

const packageNames = {
  dsl: "@openmaic/dsl",
  renderer: "@openmaic/renderer",
  generation: "@openmaic/generation",
  storage: "@openmaic/storage"
} as const;

export async function loadOpenMaicSdk(): Promise<OpenMaicRuntime> {
  const modules: OpenMaicRuntime["modules"] = {};
  const errors: string[] = [];
  for (const [key, name] of Object.entries(packageNames)) {
    try {
      // Variable dynamic import intentionally shields Explainara from SDK export churn.
      modules[key as keyof typeof packageNames] = await import(name);
    } catch (error) {
      errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { available: Boolean(modules.dsl && modules.renderer), modules, errors };
}

export function toOpenMaicCourseEnvelope(course: CourseDraft) {
  return {
    schemaVersion: "explainara-openmaic-bridge/v1",
    id: course.id,
    title: course.title,
    description: course.description,
    metadata: {
      source: "explainara",
      adaptive: true,
      tenantId: course.tenantId,
      goal: course.goal
    },
    stages: course.modules.map((module, index) => ({
      id: module.id,
      order: index,
      title: module.title,
      objective: module.objective,
      scenes: module.conceptIds.map((conceptId, sceneIndex) => {
        const concept = course.graph.nodes.find((n) => n.id === conceptId);
        return {
          id: `${module.id}:scene:${sceneIndex}`,
          kind: "slide",
          title: concept?.title ?? "Concept",
          explainara: { conceptId, difficulty: concept?.difficulty ?? 0.5 }
        };
      })
    }))
  };
}

export class OpenMaicAdapter {
  constructor(private readonly baseUrl?: string) {}

  async capabilities() {
    const sdk = await loadOpenMaicSdk();
    return { sdkAvailable: sdk.available, remoteConfigured: Boolean(this.baseUrl), errors: sdk.errors };
  }

  async generate(course: CourseDraft) {
    const envelope = toOpenMaicCourseEnvelope(course);
    if (!this.baseUrl) return { mode: "local-envelope" as const, envelope };
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(envelope)
    });
    if (!response.ok) throw new Error(`OpenMAIC endpoint failed: ${response.status}`);
    return { mode: "remote" as const, result: await response.json(), envelope };
  }
}
