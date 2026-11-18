# System Architecture

## Status and evidence

This is the Phase 0 target architecture, not an implementation description. The repository was inspected on 2026-11-18 and contains planning material only: `README.md`, three documents under `docs/SystemDesign/`, and `src/.gitkeep`. There is no extension, backend, infrastructure-as-code, package manifest, database schema, authentication configuration, or deployment configuration to verify.

The legacy capabilities listed below are therefore **reported requirements**, derived from `docs/SystemDesign/00_Design_Prompt.md`; their implementation and operational behavior remain unverified.

## Architectural intent

VS Code owns the developer experience. A TypeScript extension augments native VS Code editing rather than recreating an editor in a webview. Sandbox projects are ordinary local directories. Backend-facing work passes through explicit service and adapter boundaries so the extension does not couple to Firebase SDKs, a particular AI vendor, or an eventual identity provider.

```text
VS Code UI (commands, views, native editors, limited webviews)
                         |
              Extension application services
 Project | Preview | Sync | Concept | Database | Session
                         |
              ports / adapter interfaces
                         |
               HTTPS backend API boundary
                         |
 Firebase services and provider adapters
 Firestore | Cloud Storage | Functions/API | Auth provider (TBD)
```

The extension UI and application layer must not call Firebase directly. A backend API (implemented initially as Cloud Functions or a comparable API layer) is the authorization and business-logic boundary. This keeps Firebase replaceable behind adapters and allows future clients without duplicating policy.

## Local project model

Local directories are the primary workspace and source of day-to-day edits. The initial runtime is Vanilla JavaScript with Bootstrap; future runtime/tooling choices are project metadata rather than extension-wide assumptions.

Proposed, not yet implemented, layout:

```text
project/
  .sandbox/
    project.json       # non-secret, synchronized project metadata
    concept.md         # editable concept artifact
  src/
    index.html
    styles.css
    script.js
  assets/
  database/
    schema.json        # schema intent only; never credentials
```

`project.json` should identify a schema version, local/remote project identity, name, runtime, CSS framework, and entry point. It must not contain credentials, tokens, membership, or authorization decisions. Per-machine sync state belongs in local extension storage or a deliberately ignored local file; session tokens belong only in VS Code SecretStorage.

## Extension architecture

Use TypeScript with a small composition root and separate presentation, application, domain, and infrastructure layers.

| Layer | Responsibilities | Must not own |
| --- | --- | --- |
| Presentation | Commands, tree views, status, native editor integration, narrowly scoped webviews | Authorization or persistence policy |
| Application | Project lifecycle, sync orchestration, preview lifecycle, concepts, database workflows | VS Code UI details or Firebase SDK calls |
| Domain | Project metadata, roles, revisions, service contracts, validation rules | `vscode` imports or cloud implementation |
| Infrastructure adapters | File system, HTTP API, SecretStorage, runtime process/server integration | Business authorization decisions |

Use native VS Code editors for code and Markdown. Webviews are justified only for a preview shell and a structured database grid where native UI is insufficient. Commands and UI state may reflect known role/capability for usability, but are never the authority.

## Capability mapping

| Reported legacy capability | Intended VS Code equivalent | Notes |
| --- | --- | --- |
| Preview tab | Command plus Preview Webview Panel / external browser | Runtime-owned local preview; do not grant code extension privileges. |
| Concept tab and `/design` | `.sandbox/concept.md`, command such as `Sandbox: Generate Concept` | `/design` may be retained as a document directive; provider remains abstract. |
| Design tab | Native HTML/CSS files and editors | Vanilla/Bootstrap first; React/Tailwind later. |
| Script tab | Native JavaScript files and editor | An IIFE is namespace isolation, not a security boundary. |
| Database tab | Tree view for structure plus constrained CRUD webview | All data operations use backend API; no direct privileged database access. |
| Account projects | Sandbox sidebar tree and local-folder open flow | Remote access is explicit Pull/Push, not virtual filesystem first. |
| Owner/Editor/Viewer sharing | Backend-enforced permissions; role badges and command gating | Deferred from the MVP per confirmed scope. |

## Runtime and preview boundary

Define a `ProjectRuntime` port early. The initial Vanilla/Bootstrap runtime and a future React/Tailwind runtime implement the same lifecycle: validate, start preview, report diagnostics, and stop. The extension core must not branch on framework names.

Previewed user code is untrusted. It must run without Node.js, extension APIs, tokens, secrets, arbitrary filesystem access, or an implicit privileged message bridge. The design direction is an extension-managed loopback server and a sandboxed iframe/webview shell, with strict content security policy and a small validated message protocol. Exact preview-origin and storage behavior remain an implementation-phase decision.

## Backend API boundary

The API boundary owns identity verification, authorization, project metadata, revision checks, storage orchestration, AI gatewaying, and database CRUD policy. Typical resource areas are projects, revisions, memberships, concepts, and project data. Clients submit a base revision when pushing; the API detects conflicts rather than using last-write-wins.

The initial synchronization model should be explicit Pull, Push, and Refresh. Local editing and local preview can remain available offline; remote sync, concepts, and database operations require a valid session and connectivity. Sharing, advanced permissions, real-time collaboration, and automatic sync are deferred.

## Confirmed decisions and open decisions

Confirmed: TypeScript extension; Vanilla JavaScript plus Bootstrap initially; local folders; VS Code-native experience; Firebase-backed backend direction; service/adapter boundaries; deferred sharing/advanced permissions.

Open: authentication provider; legacy data/project format; exact database model; legacy AI provider/API; remote migration mapping; preview storage/origin details; hosting, retention, and regional requirements; and whether a browser account/invitation surface is required.
