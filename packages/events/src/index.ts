import Redis from "ioredis";
import type { ClassroomEvent } from "@explainara/shared";

export interface EventPublisher { publish(event: ClassroomEvent): Promise<void>; }

export class ConsoleEventPublisher implements EventPublisher {
  async publish(event: ClassroomEvent) { console.info("[event]", JSON.stringify({ ...event, createdAt: event.createdAt.toISOString() })); }
}

export class RedisStreamPublisher implements EventPublisher {
  private redis: Redis;
  constructor(url: string, private readonly stream = "explainara:events") { this.redis = new Redis(url, { maxRetriesPerRequest: 2 }); }
  async publish(event: ClassroomEvent) {
    await this.redis.xadd(this.stream, "MAXLEN", "~", 100_000, "*", "event", JSON.stringify({ ...event, createdAt: event.createdAt.toISOString() }));
  }
}

export function createEventPublisher(env: NodeJS.ProcessEnv = process.env): EventPublisher {
  return env.REDIS_URL ? new RedisStreamPublisher(env.REDIS_URL) : new ConsoleEventPublisher();
}
