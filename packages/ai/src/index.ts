import { z } from "zod";

export type ModelPurpose = "fast" | "reasoning" | "generation";
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface ChatOptions {
  purpose?: ModelPurpose;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ModelResponse {
  text: string;
  model: string;
  provider: string;
  latencyMs: number;
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface ModelProvider {
  id: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ModelResponse>;
}

export class OpenAICompatibleProvider implements ModelProvider {
  constructor(
    public readonly id: string,
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly defaultModel: string
  ) {}

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ModelResponse> {
    const started = Date.now();
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: options.model ?? this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 1200
      }),
      signal: options.signal
    });
    if (!response.ok) throw new Error(`${this.id} request failed: ${response.status} ${await response.text()}`);
    const json = (await response.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      text: json.choices?.[0]?.message?.content ?? "",
      model: json.model ?? options.model ?? this.defaultModel,
      provider: this.id,
      latencyMs: Date.now() - started,
      usage: { inputTokens: json.usage?.prompt_tokens, outputTokens: json.usage?.completion_tokens }
    };
  }
}

export class DemoProvider implements ModelProvider {
  id = "demo";
  async chat(messages: ChatMessage[]): Promise<ModelResponse> {
    const user = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
    return {
      text: `Let's reason from the learner's current evidence. ${user ? `You asked: ${user.slice(0, 180)}` : "We'll continue from the current concept."} Try connecting the concept to one observable example, then explain what changes and what stays constant.`,
      model: "demo-adaptive-tutor",
      provider: "demo",
      latencyMs: 1
    };
  }
}

export class ModelRouter {
  private providers = new Map<string, ModelProvider>();
  constructor(private readonly defaults: Record<ModelPurpose, { provider: string; model?: string }>) {}

  register(provider: ModelProvider) {
    this.providers.set(provider.id, provider);
    return this;
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}) {
    const purpose = options.purpose ?? "fast";
    const route = this.defaults[purpose];
    const provider = this.providers.get(route.provider);
    if (!provider) throw new Error(`AI provider not registered: ${route.provider}`);
    return provider.chat(messages, { ...options, model: options.model ?? route.model });
  }

  async json<T>(schema: z.ZodType<T>, messages: ChatMessage[], options: ChatOptions = {}): Promise<T> {
    const response = await this.chat([
      { role: "system", content: "Return valid JSON only. Do not wrap it in markdown." },
      ...messages
    ], options);
    const parsed = JSON.parse(extractJson(response.text));
    return schema.parse(parsed);
  }
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced ?? text;
  const start = Math.min(...[source.indexOf("{"), source.indexOf("[")].filter((i) => i >= 0));
  if (!Number.isFinite(start)) return source.trim();
  const endObj = source.lastIndexOf("}");
  const endArr = source.lastIndexOf("]");
  return source.slice(start, Math.max(endObj, endArr) + 1);
}

export function createModelRouter(env: NodeJS.ProcessEnv = process.env): ModelRouter {
  const demo = env.DEMO_MODE !== "false" || !env.OPENAI_API_KEY;
  const router = new ModelRouter({
    fast: { provider: demo ? "demo" : "openai", model: env.AI_FAST_MODEL ?? env.AI_DEFAULT_MODEL ?? "gpt-5.6-mini" },
    reasoning: { provider: demo ? "demo" : "openai", model: env.AI_REASONING_MODEL ?? "gpt-5.6" },
    generation: { provider: demo ? "demo" : "openai", model: env.AI_DEFAULT_MODEL ?? "gpt-5.6-mini" }
  }).register(new DemoProvider());

  if (env.OPENAI_API_KEY) router.register(new OpenAICompatibleProvider("openai", env.OPENAI_BASE_URL ?? "https://api.openai.com/v1", env.OPENAI_API_KEY, env.AI_DEFAULT_MODEL ?? "gpt-5.6-mini"));
  if (env.OPENROUTER_API_KEY) router.register(new OpenAICompatibleProvider("openrouter", env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1", env.OPENROUTER_API_KEY, env.AI_DEFAULT_MODEL ?? "openai/gpt-5.6-mini"));
  if (env.LOCAL_OPENAI_BASE_URL) router.register(new OpenAICompatibleProvider("local", env.LOCAL_OPENAI_BASE_URL, env.LOCAL_OPENAI_API_KEY ?? "local", env.AI_DEFAULT_MODEL ?? "local-model"));
  return router;
}
