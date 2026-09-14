import { NextResponse } from "next/server";
import { createModelRouter } from "@explainara/ai";
import { decideNextAction } from "@explainara/director";
import { demoKubernetesGraph } from "@explainara/knowledge";
import { demoEvents, demoRecentEvidence, demoTwin } from "@/lib/demo";

export async function POST(request:Request){
  const body=(await request.json()) as {message?:string;learningRate?:number};
  const twin=demoTwin();
  const concept=demoKubernetesGraph.nodes[2]!;
  const decision=decideNextAction({tenantId:"demo-org",learnerId:"demo-user",classroomId:"k8s",courseId:"course-k8s",conceptId:concept.id,twin,graph:demoKubernetesGraph,recentEvidence:demoRecentEvidence,recentEvents:demoEvents,userMessage:body.message});
  const router=createModelRouter();
  const answer=await router.chat([
    {role:"system",content:`You are Explainara's adaptive teacher. Be concise. Current concept: ${concept.title}. Director action: ${decision.action}. Director reason: ${decision.reason}. The learner has a misconception that NAT changes application payload. Use evidence and one follow-up question.`},
    {role:"user",content:body.message??"Continue"}
  ],{purpose:"fast",maxTokens:260});
  return NextResponse.json({message:answer.text,decision,model:{provider:answer.provider,model:answer.model,latencyMs:answer.latencyMs}});
}
