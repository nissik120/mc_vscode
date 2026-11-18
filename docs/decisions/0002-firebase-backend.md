# ADR 0002: Use Firebase Behind a Backend API Boundary

- Status: Accepted
- Date: 2026-11-18

## Context

Firebase is the confirmed backend direction. The platform requires structured project metadata, snapshots/assets, business logic, authorization, AI mediation, and eventually collaboration/data operations. Direct extension access to cloud persistence would make authorization and vendor coupling harder to control.

## Decision

Use Cloud Firestore for metadata and structured records, Cloud Storage for snapshots/assets, and Cloud Functions or an API layer for business logic. The VS Code extension accesses backend responsibilities through service and adapter interfaces and an API boundary; it does not treat Firebase client SDKs as its domain API.

The API layer verifies identity, enforces authorization, validates input, mediates AI access, and coordinates Firestore/Storage operations. Authentication provider selection is explicitly outside this ADR.

## Consequences

Firebase-specific concerns remain contained, backend policy can serve future clients, and tests can use a fake API. This adds an API layer and operational responsibility compared with direct client access. Firebase security rules remain useful defense in depth, not the sole authorization mechanism.

## Alternatives considered

- Direct Firestore/Storage access from the extension: rejected because it blurs business/authorization boundaries.
- A non-Firebase primary backend: not selected because Firebase direction is confirmed for this project.
