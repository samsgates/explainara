# Explainara

Explainara is an adaptive AI learning operating system. It turns topics, documents, repositories and structured knowledge into an interactive classroom that continuously adapts to the learner.

## Core differentiation

Explainara extends the interactive-course paradigm with five persistent intelligence layers:

1. **Learner Digital Twin**. Long-term mastery, confidence, misconception, pace, retention and evidence tracking.
2. **Knowledge Graph**. Concepts, prerequisites and relationships derived from source material.
3. **Adaptive Director**. Chooses the next pedagogical action from learner state and evidence.
4. **Interaction Engine**. Quiz, simulation, teach-back, debate, roleplay, project and coding interactions.
5. **Memory + Review**. Persistent learning history and spaced-review scheduling.

OpenMAIC integration is isolated behind `packages/openmaic-adapter`. Explainara does not fork OpenMAIC internals. The adapter can consume the published `@openmaic/*` SDK packages when available, while the rest of the product remains independently maintainable.

## Repository layout

```text
apps/
  web/         Next.js product UI + REST/SSE API
  realtime/    WebSocket collaboration server
  worker/      BullMQ background workers
packages/
  ai/          Provider-neutral LLM/model routing
  assessments/ Evaluation and answer scoring
  db/          Prisma multi-tenant data model
  director/    Adaptive classroom decision engine
  events/      Event contracts and publisher
  knowledge/   Concept graph extraction + traversal
  learner/     Learner Digital Twin logic
  mastery/     Evidence weighting + misconception detection
  memory/      Long-term memory and spaced review
  openmaic-adapter/ OpenMAIC SDK boundary
  shared/      Shared schemas and domain types
  skills/      Teaching skill registry
```

## Quick start

Requirements: Node.js 22.19+, pnpm 10+, Docker.

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`.

### Demo mode

`DEMO_MODE=true` keeps the learning experience usable without external AI credentials. The UI ships with a seeded Kubernetes learning journey and deterministic adaptive responses. Set `DEMO_MODE=false` and configure a provider key to use live AI.

## Implemented capabilities

- Multi-tenant organization/user/role data model
- Course, module, concept graph and prerequisite edges
- Learner Digital Twin with per-concept mastery
- Evidence-based mastery updates
- Misconception detection and persistence model
- Adaptive Director action policy
- Dynamic remediation and prerequisite insertion contract
- Quiz and teach-back evaluation
- Spaced review scheduler
- AI model routing with OpenAI-compatible providers
- OpenMAIC SDK adapter boundary
- Interactive learner dashboard
- Knowledge-map explorer
- Adaptive classroom with chat, interventions and a live gradient-descent simulation
- Teacher analytics and admin system views
- SSE-ready classroom endpoint and WebSocket collaboration service
- Redis/BullMQ background worker foundation
- PostgreSQL/Redis/Qdrant/S3-compatible infrastructure
- Structured event contracts and audit-ready schema
- Vitest unit tests for mastery and director logic
- Docker Compose development stack

## OpenMAIC integration

OpenMAIC publishes a modular SDK family. Explainara treats it as an optional rendering/generation provider rather than the owner of learner intelligence.

`packages/openmaic-adapter` exposes:

- SDK availability detection
- Explainara lesson -> OpenMAIC-compatible envelope conversion
- Dynamic loading of DSL/renderer/generation/storage packages
- remote OpenMAIC endpoint fallback hook

The adapter intentionally uses dynamic imports so Explainara can remain resilient across OpenMAIC package releases. Pin package versions in production after validating against your chosen OpenMAIC release.

## AI model routing

The `@explainara/ai` package supports an OpenAI-compatible transport for OpenAI, OpenRouter and local gateways. The provider registry is designed so Anthropic/Gemini native adapters can be added without changing learning-engine code.

Tasks are routed by purpose:

- `fast`: classroom turns and light extraction
- `reasoning`: adaptive planning, grading and misconception analysis
- `generation`: course and knowledge graph creation

## Security baseline

Production deployments should enable real identity-provider sessions and disable demo identity. The data model is tenant-scoped. APIs should always derive `tenantId` and `userId` from the verified server session rather than trusting client-provided values.

The repo includes session helpers that make this separation explicit. Replace the development cookie identity with your chosen OIDC/SAML/Auth.js provider before an internet-facing launch.

## Design principles

- Adaptation is based on evidence, not simplistic learner labels.
- Human teachers can override AI decisions.
- Every mastery change should be explainable from source evidence.
- Static course completion is secondary to concept mastery.
- External integrations are adapters, not core dependencies.
- Real-time experiences degrade gracefully to HTTP/SSE.

## Development commands

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Production notes

For a production deployment:

1. Set `DEMO_MODE=false`.
2. Configure a real OIDC identity provider and server-side sessions.
3. Use managed PostgreSQL, Redis, object storage and vector storage.
4. Enable TLS and reverse-proxy WebSocket/SSE endpoints.
5. Add per-tenant quotas and provider budgets.
6. Configure OpenTelemetry/Sentry.
7. Pin AI models and OpenMAIC SDK package versions.
8. Run DB migrations through CI rather than `db push`.

## License

Explainara project code is MIT licensed. OpenMAIC and any optional third-party SDK dependencies retain their own licenses and notices.
