import type { ConceptEdge, ConceptNode, KnowledgeGraph } from "@explainara/shared";

export type ExtractedConcept = {
  title: string;
  description: string;
  prerequisites?: string[];
  difficulty?: number;
  tags?: string[];
};

export function buildKnowledgeGraph(courseId: string, concepts: ExtractedConcept[]): KnowledgeGraph {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const nodes: ConceptNode[] = concepts.map((c, index) => ({
    id: `${courseId}:${normalize(c.title) || index}`,
    courseId,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty ?? Math.min(0.9, 0.35 + index * 0.06),
    estimatedMinutes: 15,
    tags: c.tags ?? [],
    metadata: {}
  }));
  const byTitle = new Map(nodes.map((n) => [n.title.toLowerCase(), n]));
  const edges: ConceptEdge[] = [];
  concepts.forEach((concept, index) => {
    const target = nodes[index];
    if (!target) return;
    for (const prerequisite of concept.prerequisites ?? []) {
      const source = byTitle.get(prerequisite.toLowerCase());
      if (source) edges.push({ from: source.id, to: target.id, relation: "prerequisite", weight: 1 });
    }
  });
  return { nodes, edges };
}

export function prerequisites(graph: KnowledgeGraph, conceptId: string): ConceptNode[] {
  const ids = graph.edges.filter((e) => e.to === conceptId && e.relation === "prerequisite").map((e) => e.from);
  return graph.nodes.filter((n) => ids.includes(n.id));
}

export function unlockedConcepts(graph: KnowledgeGraph, mastery: Record<string, number>, threshold = 0.65) {
  return graph.nodes.filter((node) => prerequisites(graph, node.id).every((pre) => (mastery[pre.id] ?? 0) >= threshold));
}

export function recommendedNext(graph: KnowledgeGraph, mastery: Record<string, number>): ConceptNode | undefined {
  return unlockedConcepts(graph, mastery)
    .filter((node) => (mastery[node.id] ?? 0) < 0.8)
    .sort((a, b) => (mastery[a.id] ?? 0) - (mastery[b.id] ?? 0))[0];
}

export function toMermaid(graph: KnowledgeGraph): string {
  const lines = ["graph TD"];
  for (const node of graph.nodes) lines.push(`  ${safe(node.id)}[\"${node.title.replaceAll('"', "'")}\"]`);
  for (const edge of graph.edges) lines.push(`  ${safe(edge.from)} -->|${edge.relation}| ${safe(edge.to)}`);
  return lines.join("\n");
}

function safe(value: string) {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

export const demoKubernetesGraph = buildKnowledgeGraph("course-k8s", [
  { title: "TCP/IP Foundations", description: "Packets, addresses, ports and routes.", difficulty: 0.35 },
  { title: "Linux Network Namespaces", description: "Isolated network stacks in Linux.", prerequisites: ["TCP/IP Foundations"], difficulty: 0.5 },
  { title: "NAT and Routing", description: "Translation, forwarding and route selection.", prerequisites: ["TCP/IP Foundations"], difficulty: 0.58 },
  { title: "Kubernetes Pod Networking", description: "Flat pod network and CNI concepts.", prerequisites: ["Linux Network Namespaces", "NAT and Routing"], difficulty: 0.64 },
  { title: "Kubernetes Services", description: "Stable service addressing and load balancing.", prerequisites: ["Kubernetes Pod Networking"], difficulty: 0.7 },
  { title: "Ingress and Gateway", description: "North-south traffic and application routing.", prerequisites: ["Kubernetes Services"], difficulty: 0.78 }
]);
