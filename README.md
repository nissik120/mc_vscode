# mc_vscode : A Sandbox Platform

A VS Code-based coding sandbox for building, previewing, and managing application projects.

The project aims to move an existing browser-based development platform into **Visual Studio Code**, using a custom extension for project management and platform-specific tools.

## Planned Features

- **Projects:** Create, open, and manage local and remote projects.
- **Accounts:** Sign in to access personal projects.
- **Sharing:** Invite collaborators as **Owner**, **Editor**, or **Viewer**.
- **Concept:** Generate and edit project concepts with AI (including a `/design` workflow).
- **Design & Script:** Edit HTML, CSS, and JavaScript using native VS Code editors.
- **Preview:** Run and inspect applications in an isolated preview environment.
- **Database:** Browse project data and perform authorized CRUD operations through a graphical interface.
- **Sync:** Synchronize local changes with remote project versions.

## Technology

| Area | Planned approach |
| --- | --- |
| Extension | TypeScript + VS Code Extension API |
| Initial projects | Vanilla JavaScript + Bootstrap |
| Future projects | React + Tailwind CSS |
| Backend | Independent API for authentication, projects, and data |
| Workspace | Standard local project files and folders |

## Proposed Repository Structure

```text
sandbox-platform/
├── extension/    # VS Code extension
├── backend/      # API and platform services
├── shared/       # Shared types and schemas
├── examples/     # Sample projects
└── docs/         # Architecture and migration plans
```

## Development Roadmap

1. Architecture and legacy platform assessment
2. VS Code extension shell
3. Local project management and Vanilla JS/Bootstrap support
4. Isolated application preview
5. Authentication, remote projects, and synchronization
6. Sharing and collaboration permissions
7. AI-assisted concepts and graphical database tools
8. Security validation and production release
9. React, Tailwind CSS, and advanced collaboration

## Getting Started

The project is in the **planning / initial development stage**. Setup and build instructions will be added when the first VS Code extension skeleton is implemented.

## Architecture Principles

- Prefer native VS Code features over custom Webviews where practical.
- Keep UI, application services, and infrastructure separate.
- Enforce shared-project permissions on the backend.
- Never expose secrets to project code or previews.
- Treat user-authored JavaScript as untrusted; an IIFE is not a security sandbox.
- Develop and validate features incrementally.

## Status

**Planned:** Architecture and phased implementation. Features listed above are targets, not a claim of current implementation.
