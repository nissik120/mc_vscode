# ADR 0001: Use a TypeScript Monorepo

- Status: Accepted
- Date: 2026-11-18

## Context

The platform will include a VS Code extension, shared API/domain contracts, and a Firebase-backed API layer. The confirmed extension language is TypeScript. The repository currently contains documentation only, so this is a target decision rather than a description of existing structure.

## Decision

Use a TypeScript monorepo when implementation begins. Organize extension, backend/API implementation, shared contracts/schemas, templates/examples, and documentation as separate packages/directories with explicit dependency direction. The extension depends on shared contracts and backend-facing interfaces, never on Firebase implementation details.

## Consequences

Contract changes can be reviewed and tested atomically, common types can be shared without duplicated hand-maintained models, and fake/API contract tests are straightforward. The repository must enforce package boundaries and manage build/test tooling carefully. A later split into separate repositories remains possible because the API/schema contract is an explicit seam.

## Alternatives considered

- Separate extension and backend repositories now: independent release cadence, but more coordination during early contract evolution.
- JavaScript extension: conflicts with the confirmed TypeScript decision and reduces type safety at boundary-heavy code.
