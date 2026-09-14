# Implementation status

This source bundle implements the Explainara PRD as a production-oriented reference architecture with a runnable demo experience and replaceable infrastructure adapters.

## Implemented end to end

- Adaptive learner dashboard and course library
- Learner Digital Twin domain model
- Per-concept mastery dimensions and evidence weighting
- Misconception detection/state
- Concept/prerequisite knowledge graph
- Adaptive Director policy and explainable decisions
- Dynamic remediation contract
- Interactive classroom and agent-aware simulation UI
- Teach-back/quiz assessment primitives
- Retention model and spaced-review queue
- Teaching skill registry
- Teacher cohort analytics
- Admin observability UI
- Course creation/generation API
- OpenMAIC SDK/remote adapter boundary
- Multi-provider OpenAI-compatible AI routing plus offline demo provider
- Source ingestion/chunking
- RAG abstraction with in-memory and Qdrant retrievers
- Multi-tenant Prisma schema and seed
- Redis event publisher contracts
- WebSocket collaboration server
- BullMQ workers
- Plugin registry and xAPI export primitive
- Study planner
- Notes-to-flashcards primitive
- Evaluation harness
- Docker Compose infrastructure
- CI workflow and source validation

## Integration-ready capabilities

These have production interfaces/scaffolding but require deployment-specific credentials or services:

- Google/Microsoft/GitHub/OIDC/SAML identity provider wiring
- Native Anthropic/Gemini transports. OpenRouter/OpenAI-compatible paths work through the generic provider
- Real S3 upload UI and presigned URLs
- PDF/DOCX/PPTX/audio/video parsers. The ingestion package is the boundary for these providers
- LMS vendor APIs for Canvas/Moodle/Blackboard. xAPI/plugin primitives are included
- TTS/ASR/avatar vendor adapters
- OpenTelemetry/Sentry exporters
- Real billing provider

## OpenMAIC strategy

Explainara intentionally does not vendor or modify the OpenMAIC repository. The adapter targets the published SDK family and can also call a separately hosted OpenMAIC endpoint. This keeps Explainara's learner-intelligence IP and data model independent from the rendering/generation implementation.

## Build verification

The source tree passes JSON/workspace consistency checks and TypeScript syntax parsing. A dependency-complete build should be run with the provided CI workflow. This generation environment does not have outbound npm access, so dependencies could not be installed here.
