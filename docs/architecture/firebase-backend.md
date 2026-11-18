# Firebase Backend Architecture

## Decision status

Firebase is the confirmed backend direction. This document defines the intended responsibility split; it does not create resources, select an authentication provider, prescribe Firebase SDK use in the extension, or claim an existing Firebase implementation.

## Service responsibilities

| Firebase capability | Intended responsibility | Notes |
| --- | --- | --- |
| Cloud Firestore | Project metadata, membership records when sharing is introduced, revision metadata/manifests, concept-generation records, database structured records, audit-oriented records | Store structured, queryable records; use transactions/batched writes for invariants. |
| Cloud Storage | Immutable project snapshots/manifests as appropriate, source assets, and large binary artifacts | Never make buckets public by default. Object paths are server-controlled. |
| Cloud Functions or API layer | Authentication-token verification, authorization, project/revision workflows, signed upload/download orchestration if used, AI gateway, validation, database CRUD, audit logging | This is the only backend endpoint surface the extension calls. |
| Authentication | Identity provider and session issuance/verification | **Undecided.** Firebase Authentication is a candidate, not a selected implementation. |

Firestore is not a substitute for an authorization layer. Cloud Storage is not the system of record for project membership or permission decisions. Cloud Functions/API code is responsible for deriving access from a verified identity and enforcing operation-level policy.

## Proposed logical records

The following are target shapes, not a migration schema or evidence of existing collections.

```text
users/{userId}
projects/{projectId}
projects/{projectId}/revisions/{revisionId}
projects/{projectId}/members/{userId}          # deferred with sharing
projects/{projectId}/concepts/{conceptId}
projects/{projectId}/data/{collection}/rows/{rowId}
auditEvents/{eventId}
```

Project metadata should include only validated fields such as owner reference, display name, runtime, CSS framework, current revision reference, timestamps, and lifecycle status. Revision records should reference immutable snapshot/object locations and carry parent/base revision information. A client-supplied owner, role, storage location, or revision head is never authoritative.

## API and adapter contract

The extension depends on interfaces such as `ProjectApi`, `RevisionApi`, `ConceptService`, `DatabaseApi`, and `SessionService`; Firebase implementations sit behind the API layer. This preserves testability with fakes and keeps cloud-vendor details out of VS Code UI and project code.

Initial API operations should cover authenticated project discovery, project metadata retrieval, revision manifest retrieval, push with a required base revision, and pull. A push must atomically reject a stale base revision rather than overwrite remote changes. Concept and database operations must be separate, authorized endpoints; arbitrary Firestore queries from the extension are out of scope.

## Data and storage rules

- Treat a project revision as immutable once published; use parent/base revision links for conflict detection.
- Validate paths, file sizes, content types, and object ownership before writing snapshots or assets.
- Use server-chosen Storage object paths and least-privilege service identities.
- Keep authorization data and audit records in structured storage; do not infer it from files inside a project snapshot.
- Define retention, deletion, backup, data residency, and export requirements before production data migration.
- Do not store provider API keys, end-user tokens, or database credentials in Firestore project documents, Storage objects, extension settings, or project metadata.

## Authentication is deliberately unresolved

The authentication provider decision is deferred. Candidate designs must support browser-based VS Code sign-in, OAuth 2.0/OIDC Authorization Code with PKCE where applicable, secure refresh/session lifecycle, verified identity at the API boundary, account switching, and revocation. Firebase Authentication may satisfy these needs, but selecting or configuring it belongs to a later decision and implementation phase.

## Unknown legacy compatibility items

No legacy database schema, Firebase/GCP configuration, source repository, identity configuration, or stored-project export is present in this repository. Before implementation, inventory the actual legacy datastore(s), file/snapshot format, account identifiers, data classifications, retention obligations, and access patterns. No assumption in this document authorizes data migration.
