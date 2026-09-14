import { PrismaClient, Role, CourseStatus, SourceType, RelationType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "explainara-demo" },
    update: {},
    create: { name: "Explainara Demo", slug: "explainara-demo" }
  });
  const user = await prisma.user.upsert({
    where: { email: "learner@explainara.local" },
    update: {},
    create: { email: "learner@explainara.local", name: "Demo Learner" }
  });
  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: { role: Role.student },
    create: { organizationId: org.id, userId: user.id, role: Role.student }
  });
  const course = await prisma.course.upsert({
    where: { id: "course-k8s" },
    update: {},
    create: {
      id: "course-k8s",
      organizationId: org.id,
      title: "Kubernetes Networking",
      description: "An adaptive path from Linux networking to Kubernetes services and ingress.",
      goal: "Understand and troubleshoot Kubernetes networking.",
      status: CourseStatus.published,
      sourceType: SourceType.topic
    }
  });
  const definitions = [
    ["tcp-ip-foundations", "TCP/IP Foundations", 0.35],
    ["linux-network-namespaces", "Linux Network Namespaces", 0.5],
    ["nat-and-routing", "NAT and Routing", 0.58],
    ["kubernetes-pod-networking", "Kubernetes Pod Networking", 0.64],
    ["kubernetes-services", "Kubernetes Services", 0.7],
    ["ingress-and-gateway", "Ingress and Gateway", 0.78]
  ] as const;
  const concepts = new Map<string, string>();
  for (const [key, title, difficulty] of definitions) {
    const concept = await prisma.concept.upsert({
      where: { courseId_externalKey: { courseId: course.id, externalKey: key } },
      update: {},
      create: { courseId: course.id, externalKey: key, title, difficulty }
    });
    concepts.set(key, concept.id);
  }
  const edgeDefs = [
    ["tcp-ip-foundations", "linux-network-namespaces"],
    ["tcp-ip-foundations", "nat-and-routing"],
    ["linux-network-namespaces", "kubernetes-pod-networking"],
    ["nat-and-routing", "kubernetes-pod-networking"],
    ["kubernetes-pod-networking", "kubernetes-services"],
    ["kubernetes-services", "ingress-and-gateway"]
  ] as const;
  for (const [from, to] of edgeDefs) {
    await prisma.conceptEdge.upsert({
      where: { fromId_toId_relation: { fromId: concepts.get(from)!, toId: concepts.get(to)!, relation: RelationType.prerequisite } },
      update: {},
      create: { courseId: course.id, fromId: concepts.get(from)!, toId: concepts.get(to)!, relation: RelationType.prerequisite }
    });
  }
  await prisma.learnerProfile.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: {},
    create: { organizationId: org.id, userId: user.id, goals: ["Learn Kubernetes networking"], pace: "balanced" }
  });
  console.log({ organization: org.slug, user: user.email, course: course.title });
}

main().finally(() => prisma.$disconnect());
