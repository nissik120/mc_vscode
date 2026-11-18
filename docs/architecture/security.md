# Security Boundaries and Migration Risks

## Evidence boundary

This repository has no executable preview, backend, authentication, deployment configuration, or dependency manifests. The controls below are target requirements informed by the planning material; they are not verified controls in an existing system.

## Trust boundaries

| Boundary | Trust rule | Required control |
| --- | --- | --- |
| User project files → extension | Project content is untrusted, including metadata and Markdown. | Schema validation, path containment checks, size limits, never interpolate content into privileged HTML/shell/API calls. |
| Previewed application → extension | Preview JavaScript is untrusted. | Isolated preview, sandboxed iframe/webview, restrictive CSP, no Node or extension API exposure, validated narrow messages only. |
| Webview → extension host | Webview messages can be forged or malformed. | Explicit message schema, origin/session checks where possible, payload limits, and authorization re-check before sensitive action. |
| Extension → backend API | Client state and UI gating are untrusted. | TLS, short-lived session credentials, server-side identity verification and operation-level authorization. |
| Backend → Firebase | Server code is trusted only within least privilege. | Dedicated service identities, server-controlled document/object paths, Firebase rules as defense in depth, audit logging. |
| Backend → AI provider | Prompts and model output are untrusted data. | Keep keys server-side, quotas/rate limits, redact sensitive content, never execute model output as commands/code. |

## Authorization model

The backend is the sole authority. On every protected request it must derive the caller from a verified session and evaluate `(caller, project, requested operation)`. Project IDs, roles, and ownership sent by the extension are inputs to validate, not proof of entitlement.

The reported legacy roles are Owner, Editor, and Viewer. Their exact permission matrix is not required for the initial MVP because sharing and advanced permissions are deferred. When introduced, the minimum rule is that Viewer cannot mutate remote data, and removing or weakening extension commands is only an ergonomic control. A local copy cannot be made a real security boundary: a Viewer can change files on their own disk, but the backend must reject remote writes.

## Preview and webview controls

An IIFE only limits JavaScript scope; it does not isolate untrusted code. The preview design must use an extension-managed loopback endpoint restricted to loopback binding, prevent traversal and host-header abuse, and isolate user code in a sandboxed context. Decide deliberately whether an opaque origin or storage-capable origin is acceptable before implementation.

Webviews should use restrictive content security policies, nonces or bundled external scripts, limited `localResourceRoots`, safe DOM insertion (`textContent`/escaping), and no tokens/secrets in HTML or postMessage payloads. The extension must not enable arbitrary Node process execution from project content. Workspace Trust should gate operations that execute project tooling.

## Firebase and API controls

- Enforce authorization in Cloud Functions/API code; do not rely solely on client behavior or Firestore/Storage rules.
- Apply Firestore/Storage rules as a second line of defense consistent with server ownership.
- Validate document IDs, collection/table names, filters, pagination, payload shape, and concurrency versions server-side.
- Keep Storage private; issue narrowly scoped, time-limited access only after authorization if direct transfer is required.
- Use transaction/invariant checks for owner/membership transitions once collaboration exists.
- Record security-relevant actions without logging source secrets, credentials, or sensitive prompt contents.

## Migration risk register

| Risk | Why it matters | Mitigation / decision gate |
| --- | --- | --- |
| Missing legacy source and data evidence | Field mappings, auth compatibility, and migration cost cannot be assessed. | Obtain source/config exports and a data inventory before any importer or migration. |
| Untrusted project execution | A downloaded/shared project may attempt local compromise or token theft. | Preview isolation, no privileged bridge, Workspace Trust, security tests. |
| Authentication provider not selected | Session semantics and account linking cannot be finalized. | ADR keeps choice open; choose before authenticated remote features. |
| Direct client access to Firebase | Can bypass business policy and expand attack surface. | Extension uses backend API/adapters only. |
| Snapshot synchronization conflicts | Naive last-write-wins can lose work. | Immutable revisions, base revision checks, explicit Pull/Push, merge UX. |
| Unknown legacy database model | CRUD and schema migration can corrupt or expose data. | Characterize legacy data and authorization before database feature or migration. |
| AI prompt/data exposure and cost abuse | Could leak sensitive content or incur uncontrolled spend. | Server-side provider keys, quotas, moderation/privacy policy, output treated as data. |
| Supply chain and generated templates | Dependencies/templates execute in developer environments. | Pin and audit dependencies, review templates, lockfiles, CI scanning. |
| Residency, retention, deletion obligations unknown | Firebase region/storage policies may be unsuitable. | Define legal/operational requirements before creating production resources. |

## Security acceptance gates

Before preview: threat model, traversal tests, CSP/message validation tests, and no secret exposure path. Before authenticated API use: session lifecycle tests, authorization matrix tests, logging redaction, and Firebase-rule/API alignment. Before data migration or production: tested backup/rollback plan, retention/deletion design, data classification, dependency/secret scan, and external security review appropriate to risk.
