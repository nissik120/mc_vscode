# Coding Sandbox VS Code Extension

Phase 1 provides a desktop VS Code extension shell with a Sandbox Activity Bar container, a **My Projects** tree using deterministic mock data, and placeholder commands. It has no filesystem project creation, backend, Firebase, authentication, preview, or sharing functionality.

## Prerequisites

Run commands from this directory:

```sh
cd /Users/nvision/Documents/Workspace/Gigs/msc-sandbox/extension
```

Install Node.js 20.19+, Node.js 22.13+, or a newer supported release with npm, then install the development dependencies:

```sh
npm install
```

## Develop

Open the `extension` directory in VS Code and use **Run and Debug: Run Coding Sandbox Extension** (or press F5). This compiles the extension and opens an Extension Development Host with a temporary profile. Select the Sandbox icon in the Activity Bar to see **My Projects**.

From a terminal:

```sh
npm run compile
npm run watch
```

## Tests

```sh
npm test
npm run test:smoke
```

`npm test` compiles, lints, and runs the tree-provider and command-registration tests inside an Extension Development Host. `npm run test:smoke` runs the focused activation smoke test.

## Phase 1 commands

- `Sandbox: Create Project` — informs the user that project scaffolding is a later phase.
- `Sandbox: Open Project` — informs the user that opening projects is a later phase.
- `Sandbox: Refresh Projects` — refreshes the My Projects tree.
- `Sandbox: Show Welcome` — describes the current offline/mock-only shell.
