import { NextResponse } from "next/server";
import { buildKnowledgeGraph } from "@explainara/knowledge";
import { OpenMaicAdapter } from "@explainara/openmaic-adapter";
import type { CourseDraft } from "@explainara/shared";

export async function POST(request:Request){
  const body=await request.json() as {title?:string;goal?:string;topic?:string};
  const id=`course-${crypto.randomUUID().slice(0,8)}`;
  const topic=body.topic??body.title??"New topic";
  const concepts=[
    {title:`${topic}: Foundations`,description:"Core language, definitions and mental model."},
    {title:`${topic}: Mechanisms`,description:"How the system works internally.",prerequisites:[`${topic}: Foundations`]},
    {title:`${topic}: Application`,description:"Apply the mechanism to realistic problems.",prerequisites:[`${topic}: Mechanisms`]},
    {title:`${topic}: Tradeoffs`,description:"Evaluate alternatives and constraints.",prerequisites:[`${topic}: Application`]},
    {title:`${topic}: Mastery Project`,description:"Synthesize the concepts in an open-ended task.",prerequisites:[`${topic}: Tradeoffs`]}
  ];
  const graph=buildKnowledgeGraph(id,concepts);
  const draft:CourseDraft={id,tenantId:"demo-org",title:body.title??topic,description:`Adaptive learning path for ${topic}`,goal:body.goal??`Master ${topic}`,sourceType:"topic",modules:graph.nodes.map((n,i)=>({id:`m${i+1}`,title:n.title,objective:n.description,conceptIds:[n.id]})),graph};
  const openmaic=await new OpenMaicAdapter(process.env.OPENMAIC_BASE_URL).generate(draft);
  return NextResponse.json({course:draft,openmaic});
}
