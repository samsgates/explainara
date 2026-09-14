# Security baseline

- Derive user and tenant identity from verified server sessions.
- Never accept `tenantId` as authorization proof.
- Enforce RBAC at route/service boundaries.
- Store provider credentials server-side only.
- Use short-lived signed object URLs for private learning material.
- Treat uploaded HTML, simulations and generated interactive content as untrusted. Sandbox it.
- Validate external URLs against SSRF rules before server-side fetches.
- Add malware scanning to uploaded files in internet-facing deployments.
- Maintain immutable audit events for administrative actions.
- Provide learner data export/deletion and personalization controls.
- Add per-tenant model budgets/rate limits.
