# Migration Phase Plan

## Scope rule

Phase 0 is documentation only and completes with these architecture documents and ADRs. It does not implement an extension, create Firebase resources, select/configure authentication, change deployment, or alter legacy data.

## Phases

| Phase | Objective | Principal deliverables | Exit gate |
| --- | --- | --- | --- |
| 0 — Assessment | Establish evidence, target architecture, decisions, risks, and plan. | Architecture docs, legacy inventory, ADRs. | Stakeholders review open questions; no product code change. |
| 1 — Foundation | Establish TypeScript monorepo and extension layering. | Extension shell, shared contract location, tests/CI baseline. | Launchable development extension with no Firebase/auth implementation. |
| 2 — Local projects | Create/open/validate local Vanilla/Bootstrap project directories. | Project metadata schema, templates, local project service. | Malformed metadata and unsafe paths rejected. |
| 3 — Local preview | Provide safe local preview lifecycle. | Runtime interface, Vanilla runtime, preview panel/server, diagnostics. | Isolation and lifecycle tests pass; no secrets accessible to project code. |
| 4 — Concept workflow | Provide local concept artifact and provider abstraction. | Markdown workflow, command, mock/test provider. | No live AI key or provider commitment required. |
| 5 — Backend contract | Define/test API contract and Firebase adapter design. | API schemas, fake backend/contract tests, Firebase implementation plan. | Backend calls uniformly model auth/conflict/error states. |
| 6 — Authentication | Select provider and implement session lifecycle. | Approved auth ADR update, browser sign-in, secure session storage. | Provider decision explicitly approved; sign-in/out/refresh/revocation tests pass. |
| 7 — Remote projects/sync | Link folders to remote projects and synchronize revisions. | Pull/Push/Refresh, manifest/revision API, conflict handling. | Stale writes rejected; two-client conflict scenarios safe. |
| 8 — Sharing and roles | Add membership/invitations if still prioritized. | Role policy, backend authorization, role-aware UX/audit. | Full server authorization matrix passes. |
| 9 — AI gateway | Connect concepts to selected AI provider through backend. | Gateway adapter, quotas, audit/privacy controls. | No provider key ships in extension/project files. |
| 10 — Database UX | Provide authorized graphical data access. | Database tree/grid, API validation, concurrency behavior. | CRUD authorization and injection/message tests pass. |
| 11 — Hardening/release | Validate production readiness. | Threat-model review, operational runbooks, retention/backup/rollback, release pipeline. | Security and operational gates approved. |
| 12 — Future runtimes | Add React/Tailwind through adapters. | Runtime/style plugins and templates. | No core sync/auth/UI redesign. |

## Dependencies and deferrals

Authentication selection blocks Phase 6 but not local phases 1–4. Firebase resource creation is not permitted in Phase 0. Remote data migration is blocked until the legacy discovery items in `legacy-inventory.md` are resolved. Sharing and advanced permissions are explicitly deferred from the initial MVP; Phase 8 should be scheduled only after local workflow and synchronization are viable.

## Cross-phase controls

Every phase must retain the service/adapter boundary, document new assumptions, and include proportionate tests. Security is not a final-only phase: preview isolation is a Phase 3 gate, backend authorization is a Phase 7/8 gate, and data migration requires a separately approved reversible plan. Do not advance into data migration, production deployment, or auth provider implementation based solely on the planning documents currently in this repository.
