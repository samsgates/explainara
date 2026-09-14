# Explainara Architecture

## Runtime flow

```text
Source -> ingestion -> chunks -> retrieval / graph extraction
                              |             |
                              v             v
                         grounding     knowledge graph
                                           |
Learner evidence -> mastery -> digital twin -> adaptive director
                                           |
                                           v
       teacher / quiz / simulation / roleplay / teach-back / project
                                           |
                                           v
                                      OpenMAIC adapter
```

## Boundaries

- **OpenMAIC** owns compatible course rendering/generation capabilities.
- **Explainara** owns learner state, mastery, misconceptions, adaptation, review policy, tenant identity and analytics.
- **Providers** are replaceable adapters.
- **Classroom events** are append-friendly evidence, not hidden mutable state.

## Reliability

Long jobs run through BullMQ. Interactive turns use HTTP/SSE and can use the WebSocket service for collaboration/presence. PostgreSQL is the source of truth. Redis is ephemeral coordination. Qdrant is derived retrieval state. Object storage contains source/media assets.
