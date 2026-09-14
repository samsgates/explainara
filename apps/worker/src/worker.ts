import { Worker } from "bullmq";
import IORedis from "ioredis";
import { buildKnowledgeGraph } from "@explainara/knowledge";

const connection=new IORedis(process.env.REDIS_URL??"redis://localhost:6379",{maxRetriesPerRequest:null});

const generation=new Worker("explainara:generation",async job=>{
  if(job.name==="build-knowledge-graph"){
    const {courseId,concepts}=job.data as {courseId:string;concepts:Array<{title:string;description:string;prerequisites?:string[]}>};
    const graph=buildKnowledgeGraph(courseId,concepts);
    return {nodes:graph.nodes.length,edges:graph.edges.length,graph};
  }
  return {ignored:true};
},{connection,concurrency:4});

const reviews=new Worker("explainara:reviews",async job=>{
  // Production handler reads learner concept states, computes retention and creates notifications.
  return {learnerId:job.data.learnerId,scheduledAt:new Date().toISOString()};
},{connection,concurrency:8});

const analytics=new Worker("explainara:analytics",async job=>{
  // Production handler aggregates mastery gain/hour and intervention effectiveness.
  return {batch:job.id,processedAt:new Date().toISOString()};
},{connection,concurrency:2});

for(const worker of [generation,reviews,analytics])worker.on("failed",(job,error)=>console.error("worker failed",job?.name,error));
console.log("Explainara workers started");
