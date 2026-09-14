import { Queue } from "bullmq";
import IORedis from "ioredis";
export const connection=new IORedis(process.env.REDIS_URL??"redis://localhost:6379",{maxRetriesPerRequest:null});
export const generationQueue=new Queue("explainara:generation",{connection});
export const reviewQueue=new Queue("explainara:reviews",{connection});
export const analyticsQueue=new Queue("explainara:analytics",{connection});
