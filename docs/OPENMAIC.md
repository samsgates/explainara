# OpenMAIC integration

Explainara intentionally does not copy OpenMAIC source code. It integrates through published SDK packages or a remote endpoint.

Current adapter targets the modular packages:

- `@openmaic/dsl`
- `@openmaic/renderer`
- `@openmaic/generation`
- `@openmaic/storage`

The adapter uses variable dynamic imports to keep SDK changes from leaking into Explainara's learner-intelligence packages. Before production, pin the exact OpenMAIC SDK versions you have integration-tested.
