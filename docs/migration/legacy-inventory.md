# Legacy Inventory and VS Code Mapping

## Inspection result

**Verified repository findings (2026-11-18):**

- The root README describes a planned VS Code sandbox, TypeScript extension direction, Vanilla JavaScript/Bootstrap initial runtime, and a future React/Tailwind direction.
- `docs/SystemDesign/00_Design_Prompt.md` is a requirements/assessment prompt.
- `docs/SystemDesign/01_Claude_Response_Sandbox for VS Code_Architecture and Migration Assessment.md` and `02_ChatGPT_Response.md` are prior architecture proposals, not source-of-truth implementation evidence.
- `src/` contains only `.gitkeep`.
- No application source, package manifest, lockfile, database schema/migration, Firebase/GCP configuration, authentication configuration, AI integration code, CI workflow, container/deployment manifest, or legacy project data is present.

Accordingly, this repository cannot verify the actual legacy architecture or implementation. Statements marked **Reported** come from planning documents and require validation against the legacy system.

## Reported capability inventory

| Area | Reported legacy capability | Evidence status | Intended VS Code equivalent |
| --- | --- | --- | --- |
| Editing | Design tab for HTML/CSS and Script tab for JavaScript | Reported | Normal workspace files and native VS Code editors. |
| Runtime | HTML, Vanilla JavaScript, Bootstrap | Reported | Initial `vanilla` runtime and `bootstrap` styling metadata/template. |
| Future runtime | React and Tailwind desired | Reported future requirement | Runtime/style adapters, not a replacement core. |
| Preview | Preview tab renders app | Reported | Local runtime preview command and isolated Preview panel/browser. |
| Concepts | GPT-assisted Concept tab; `/design` convention | Reported | Markdown concept artifact plus extension command through provider abstraction. |
| Data | Graphical Database tab with CRUD | Reported | Structure tree plus constrained database grid calling backend API. |
| Accounts | Users sign in and access projects | Reported | Browser-based extension session flow; provider intentionally undecided. |
| Sharing | Owner, Editor, Viewer roles | Reported | Backend-enforced membership when sharing is brought into scope; deferred MVP. |
| Remote state | Account-based remote projects | Reported | Linked local folder with explicit revision-aware Pull/Push. |
| Hosting | Previously self-hosted and hosted on Google Cloud | Reported historical context | No migration/hosting inference; Firebase is the new confirmed direction. |

## Project formats and data structures

No actual legacy project files, export format, version marker, or persisted records were found. The five reported tabs do not establish whether the legacy system stores files, fields, blobs, database rows, or generated artifacts. The reported IIFE wrapper around scripts is likewise not verified in source.

The proposed local format (`.sandbox/project.json`, `concept.md`, conventional source files) is a **new target contract**, not a discovered legacy format. Do not write an importer until representative legacy exports have been inspected and a mapping is approved.

## Database, authentication, AI, and deployment assessment

| Concern | Verified finding | Unknown / required discovery |
| --- | --- | --- |
| Database | No schema, connection configuration, queries, or migration files found. | Engine/model, tenancy, schema ownership, CRUD authorization, export strategy, data volume and retention. |
| Authentication | No provider or auth configuration found. | Current provider, account IDs, login methods, session/token lifecycle, account-linking needs, user migration constraints. |
| AI | Only reported GPT-backed concept generation and `/design` convention. | Provider, endpoint, model, key custody, prompt templates, retention, quotas, safety controls. |
| Deployment | No deployment/IaC/CI/configuration found. | Existing GCP services, environments, domains, secrets, observability, rollback and compliance controls. |

## Required discovery before migration work

1. Obtain read-only access to the legacy source repository and deployment inventory.
2. Export representative, sanitized projects spanning every known format and state.
3. Document actual persistence schemas, object/file layout, user identity identifiers, membership records, and authorization checks.
4. Trace the preview execution path and every extension/backend-facing secret boundary.
5. Capture actual authentication and AI flows without copying secrets.
6. Reconcile findings with this target contract; record approved field mappings and a reversible migration/rollback plan.
