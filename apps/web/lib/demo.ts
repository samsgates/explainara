import { demoKubernetesGraph } from "@explainara/knowledge";
import { createLearnerTwin } from "@explainara/learner";
import { applyEvidence, emptyConceptState } from "@explainara/mastery";
import type { ClassroomEvent, LearnerDigitalTwin, LearningEvidence } from "@explainara/shared";

export function demoTwin(): LearnerDigitalTwin {
  const twin = createLearnerTwin("demo-user", "demo-org");
  const values = [0.86, 0.72, 0.48, 0.42, 0.22, 0.1];
  for (const [index,node] of demoKubernetesGraph.nodes.entries()) {
    const base = emptyConceptState(node.id);
    twin.concepts[node.id] = { ...base, mastery: values[index] ?? .2, confidence: Math.min(.9,(values[index] ?? .2)+.12), retentionStrength:.56 + (index===0?.18:0), evidenceCount: 3 + index };
  }
  const nat = demoKubernetesGraph.nodes[2];
  if (nat) twin.concepts[nat.id]!.misconceptions = [{ id:"nat:payload", conceptId:nat.id, label:"nat-modifies-payload", explanation:"NAT normally rewrites address and port metadata, not application payloads.", confidence:.92, frequency:2, resolved:false, firstDetectedAt:new Date(Date.now()-86400000), lastDetectedAt:new Date() }];
  twin.goals=["Understand and troubleshoot Kubernetes networking"];
  twin.strengths=[demoKubernetesGraph.nodes[0]!.id];
  twin.weaknesses=[demoKubernetesGraph.nodes[2]!.id,demoKubernetesGraph.nodes[3]!.id];
  twin.behavioralSignals=["Retains concrete network diagrams better than abstract descriptions","High confidence errors around NAT indicate a persistent mental model","Responds well to short simulation-based checks"];
  return twin;
}

export const demoEvents: ClassroomEvent[] = [
  { id:"1",tenantId:"demo-org",learnerId:"demo-user",classroomId:"k8s",type:"lesson_started",conceptId:demoKubernetesGraph.nodes[2]!.id,payload:{title:"NAT and Routing"},createdAt:new Date(Date.now()-22*60000)},
  { id:"2",tenantId:"demo-org",learnerId:"demo-user",classroomId:"k8s",type:"question_asked",conceptId:demoKubernetesGraph.nodes[2]!.id,payload:{question:"Does NAT change the packet data?"},createdAt:new Date(Date.now()-16*60000)},
  { id:"3",tenantId:"demo-org",learnerId:"demo-user",classroomId:"k8s",type:"misconception_detected",conceptId:demoKubernetesGraph.nodes[2]!.id,payload:{label:"NAT modifies payload"},createdAt:new Date(Date.now()-13*60000)},
  { id:"4",tenantId:"demo-org",learnerId:"demo-user",classroomId:"k8s",type:"teacher_intervention",conceptId:demoKubernetesGraph.nodes[2]!.id,payload:{action:"GENERATE_SIMULATION"},createdAt:new Date(Date.now()-10*60000)},
  { id:"5",tenantId:"demo-org",learnerId:"demo-user",classroomId:"k8s",type:"mastery_updated",conceptId:demoKubernetesGraph.nodes[2]!.id,payload:{before:.38,after:.48},createdAt:new Date(Date.now()-5*60000)}
];

export const demoRecentEvidence: LearningEvidence[] = [
  { id:"e1",learnerId:"demo-user",conceptId:demoKubernetesGraph.nodes[2]!.id,type:"conversation",score:.38,confidence:.9,metadata:{},createdAt:new Date(Date.now()-13*60000) },
  { id:"e2",learnerId:"demo-user",conceptId:demoKubernetesGraph.nodes[2]!.id,type:"simulation",score:.58,confidence:.7,metadata:{},createdAt:new Date(Date.now()-5*60000) }
];
