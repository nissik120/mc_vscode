# VS Code Extension Coding Sandbox — Architecture & Migration Assessment

## 1. Objective

I want to redesign an existing browser-based coding/programming sandbox so that **Visual Studio Code becomes the primary development environment**, with a custom **VS Code extension** providing the platform-specific functionality.

The existing application was originally designed as a self-hosted web application and was previously hosted on **Google Cloud**.

The goal is **not simply to embed the existing website inside VS Code**.

Instead, I want to assess how the existing platform should be restructured so that:

- VS Code provides the code-editing environment.
- A custom VS Code extension provides the platform workflow and additional functionality.
- Existing project concepts are preserved where appropriate.
- Users can authenticate and access their own projects.
- Projects can be shared with other users.
- Existing Vanilla JavaScript / Bootstrap projects continue to work.
- React and Tailwind CSS can be supported later without requiring another architectural redesign.
- Previewing, project metadata, database management, AI-assisted concept generation, and collaboration integrate naturally with VS Code.

Do **not** begin implementation immediately.

First analyze the required architecture and produce a phased migration/design plan.

---

# 2. Existing Platform

## 2.1 Current Technology

The current platform primarily supports:

- HTML
- Vanilla JavaScript
- Bootstrap CSS

Future support is planned for:

- React
- Tailwind CSS

The architecture should therefore avoid assumptions that projects will always consist only of:

```text
HTML + CSS + JavaScript
```

It should eventually support projects such as:

```text
Vanilla JS + Bootstrap
React + Tailwind
potential future frameworks
```

The framework/tooling selection should ideally be represented as project metadata rather than deeply embedded in the extension architecture.

---

# 3. Current User Model

Each user can sign into the platform.

After authentication, the user can access their projects.

A project belongs to a user but may also be shared with other users.

The existing sharing model supports at least the following roles:

```text
Owner
Editor
Viewer
```

Expected behavior:

### Owner

Can:

- modify project source
- modify project metadata
- modify database contents
- invite collaborators
- change collaborator permissions
- remove collaborators
- delete the project

### Editor

Can:

- open the project
- modify permitted project files
- modify application code
- potentially modify database contents depending on the final permission model

Should not automatically receive ownership-level administrative permissions.

### Viewer

Can:

- open the project
- inspect project contents
- inspect the application preview
- potentially inspect database contents

Must not be able to modify the project.

Assess whether these permissions should be implemented only by the backend or additionally reflected through VS Code commands and UI states.

The backend must remain the authority for authorization. Hiding a VS Code command must **not** be treated as a security boundary.

---

# 4. Existing Workspace Model

The current application exposes five principal tabs:

```text
1. Preview
2. Concept
3. Design
4. Script
5. Database
```

The migration should preserve the **functions** represented by these tabs, but they do not necessarily need to remain literal tabs.

Determine which capabilities should become:

- normal VS Code files
- custom editors
- Webview Views
- Webview Panels
- sidebar/tree views
- commands
- virtual documents
- status-bar actions
- custom project explorers
- integrated VS Code functionality

Do not automatically implement all five existing tabs as Webviews.

Prefer native VS Code capabilities wherever they provide a better developer experience.

---

# 5. Concept Capability

The current **Concept** tab contains an AI-assisted system-design workflow.

The user writes a natural-language description explaining the application/system they want to create.

A GPT-based service processes that prompt.

The current convention uses:

```text
/design
```

to indicate that the GPT should generate a project/application concept.

Conceptually:

```text
User prompt
   |
   v
/design command
   |
   v
GPT / AI service
   |
   v
Generated concept
   |
   v
Concept area
```

The resulting concept may contain items such as:

- application purpose
- features
- functional requirements
- suggested screens
- workflows
- entities
- data requirements
- UI ideas
- implementation considerations

Assess how this should work inside VS Code.

Possible implementations to evaluate include:

```text
concept.md
```

or:

```text
.project/concept.md
```

or a dedicated extension view.

Consider whether `/design` should remain the user-facing command, become a VS Code command such as:

```text
Sandbox: Generate Concept
```

or support both approaches.

The AI integration must be abstracted behind an interface so that the extension is not permanently coupled to one LLM provider.

For example:

```text
ConceptService
      |
      +-- OpenAI provider
      +-- future provider
      +-- mock/test provider
```

Do not expose API keys in project source files or Webview JavaScript.

---

# 6. Design Capability

The current **Design** tab contains:

- HTML markup
- relevant CSS descriptors/styles

Currently this approximately represents the application's presentation layer.

For example:

```text
HTML
Bootstrap classes
custom CSS
```

When migrating to VS Code, assess whether this should become conventional files such as:

```text
src/
  index.html
  styles.css
```

or another structure.

The design must accommodate future React/Tailwind projects where the equivalent may instead look like:

```text
src/
  App.tsx
  components/
  index.css
```

Therefore, avoid creating an architecture that requires every project to contain one monolithic "Design" document.

---

# 7. Script Capability

The current **Script** tab contains JavaScript application logic.

For security/isolation reasons, current scripts are expected to use a guard similar to:

```javascript
(function () {
    // user code
})();
```

Assess the purpose and actual security guarantees of this mechanism.

Do **not** assume that an IIFE provides a genuine security sandbox.

Explicitly distinguish between:

```text
namespace isolation
```

and:

```text
security isolation
```

If user-generated JavaScript is executed in previews, design a proper execution/isolation strategy.

Evaluate mechanisms such as:

- sandboxed iframe execution
- Content Security Policy
- isolated preview origin
- restricted message passing
- Webview sandboxing
- process isolation where necessary
- disabling unrestricted Node.js access
- controlled bridge APIs

The previewed application must not automatically gain access to:

- VS Code extension APIs
- extension secrets
- authentication tokens
- backend credentials
- arbitrary local files
- the host filesystem
- Node.js APIs

unless an explicit, carefully controlled capability is introduced.

---

# 8. Database Capability

The existing **Database** tab allows the user to view the project's database graphically and perform CRUD operations.

Supported operations should include:

```text
Create
Read
Update
Delete
```

The database interface should allow users to inspect data in a more visual form rather than requiring direct database queries for everything.

Assess how this should be represented in VS Code.

Possibilities include:

```text
Explorer tree
   |
   +-- Database
       |
       +-- Tables / Collections
           |
           +-- users
           +-- products
           +-- settings
```

with an associated Webview for:

```text
table/grid display
record editor
create dialog
delete confirmation
filtering
sorting
pagination
```

Determine what functionality belongs:

```text
Extension
Backend API
Database service
```

The VS Code extension must **not** connect directly to a production database using privileged database credentials.

Preferred architecture:

```text
VS Code Extension
       |
       | HTTPS/API
       v
Backend
       |
       v
Authorization Layer
       |
       v
Database
```

All CRUD operations must be authorized server-side based on:

```text
user
project
project role
requested operation
```

---

# 9. Preview Capability

The existing **Preview** tab renders the application as an end user would experience it.

The VS Code implementation should provide equivalent behavior.

Assess implementation options including:

- VS Code Webview Panel
- local development server
- embedded browser preview
- external browser
- framework-specific development server

The preview system should eventually support both:

```text
Vanilla JS projects
```

and:

```text
React projects
```

without requiring the core extension architecture to be replaced.

For example:

```text
Project Runtime
      |
      +-- VanillaRuntime
      |
      +-- ReactRuntime
      |
      +-- future runtimes
```

The preview should support rapid development feedback where possible.

Evaluate:

- automatic reload
- hot module replacement
- console forwarding
- runtime error reporting
- build errors
- port management
- lifecycle of development servers

---

# 10. Proposed Project Representation

Assess whether each sandbox project should become an ordinary directory/workspace.

For example:

```text
my-project/
├── .sandbox/
│   ├── project.json
│   └── concept.md
├── src/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── database/
│   └── schema.json
├── package.json
└── README.md
```

A possible metadata file might contain:

```json
{
  "projectId": "...",
  "name": "Example Project",
  "runtime": "vanilla",
  "cssFramework": "bootstrap",
  "remoteProjectId": "...",
  "version": 1
}
```

For a future React project:

```json
{
  "projectId": "...",
  "name": "Example React Project",
  "runtime": "react",
  "cssFramework": "tailwind",
  "remoteProjectId": "...",
  "version": 1
}
```

Determine which metadata should be:

- committed with the project
- local-only
- retrieved from the backend
- stored using VS Code extension storage
- stored using VS Code SecretStorage

Never place authentication tokens or secrets inside `project.json`.

---

# 11. Authentication

Design authentication specifically for a VS Code extension.

The intended flow is roughly:

```text
VS Code
   |
   v
Sandbox Extension
   |
   v
Sign In
   |
   v
Browser / identity provider
   |
   v
Backend authorization
   |
   v
Extension receives authenticated session
```

Assess appropriate mechanisms such as:

- OAuth 2.0 Authorization Code + PKCE
- browser-based login
- VS Code URI handlers
- short-lived access tokens
- refresh-token handling
- VS Code SecretStorage

Avoid embedding login credentials directly inside a Webview.

The architecture must account for:

- sign in
- sign out
- expired sessions
- token refresh
- revoked access
- switching accounts
- offline/local project access where appropriate

---

# 12. Project Dashboard / Explorer

The extension should provide a project-oriented interface.

A possible sidebar:

```text
SANDBOX

My Projects
├── Project A
├── Project B
└── Project C

Shared With Me
├── Project D [Editor]
└── Project E [Viewer]
```

Selecting a project should make it possible to:

- open it locally
- synchronize it
- preview it
- inspect its concept
- inspect/edit its database
- manage sharing when authorized

Evaluate whether projects should be:

1. downloaded/cloned into normal folders,
2. represented through a VS Code virtual filesystem,
3. synchronized into extension-managed workspaces,
4. or implemented through a hybrid architecture.

Prefer normal filesystem/workspace semantics unless a virtual filesystem provides a strong technical benefit.

---

# 13. Local and Remote Project State

The existing system is account-based and remotely stores projects.

VS Code naturally operates on local files.

The architecture must therefore explicitly address synchronization between:

```text
Local workspace
      |
      v
Synchronization layer
      |
      v
Remote project
```

Analyze:

- initial project download
- uploads
- local modifications
- remote modifications
- conflict detection
- project versions/revisions
- concurrent editing
- offline development
- reconnect behavior
- editor/viewer permissions
- deleted remote projects
- collaboration updates

Do not simply implement automatic last-write-wins synchronization without discussing the implications.

For the initial version, a simpler explicit synchronization workflow may be appropriate:

```text
Pull Project
Push Changes
Refresh
```

before real-time collaboration is introduced.

---

# 14. Sharing and Collaboration

Projects must be shareable with other registered users.

Required roles:

```text
OWNER
EDITOR
VIEWER
```

Evaluate a backend model similar to:

```text
users
projects
project_members
project_versions
```

For example:

```text
project_members

project_id
user_id
role
created_at
```

Determine authorization rules for:

- reading project files
- modifying project files
- modifying database records
- viewing preview
- inviting members
- removing members
- changing permissions
- deleting projects

All authorization must be enforced by the backend.

---

# 15. Backend Boundary

Although the old platform was hosted on Google Cloud, do not assume Google Cloud must remain the final hosting platform.

Define clean interfaces between:

```text
VS Code Extension
        |
        v
Backend API
        |
        +-- Authentication
        +-- Projects
        +-- Collaboration
        +-- Synchronization
        +-- AI gateway
        +-- Database API
        |
        v
Persistent storage
```

The extension should not depend directly on a particular database vendor or cloud provider.

Recommend an API style where appropriate, for example:

```text
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

GET    /projects/:id/members
POST   /projects/:id/members
PATCH  /projects/:id/members/:userId
DELETE /projects/:id/members/:userId

GET    /projects/:id/files
POST   /projects/:id/sync

POST   /projects/:id/concept/generate

GET    /projects/:id/database/...
POST   /projects/:id/database/...
PATCH  /projects/:id/database/...
DELETE /projects/:id/database/...
```

These are examples only. Recommend a cleaner structure if appropriate.

---

# 16. Extension Architecture

Propose a maintainable VS Code extension architecture.

For example:

```text
extension/
├── src/
│   ├── extension.ts
│   │
│   ├── commands/
│   │   ├── authCommands.ts
│   │   ├── projectCommands.ts
│   │   ├── previewCommands.ts
│   │   ├── conceptCommands.ts
│   │   └── databaseCommands.ts
│   │
│   ├── auth/
│   │   ├── authService.ts
│   │   └── sessionStore.ts
│   │
│   ├── api/
│   │   ├── apiClient.ts
│   │   ├── projectApi.ts
│   │   ├── databaseApi.ts
│   │   └── aiApi.ts
│   │
│   ├── projects/
│   │   ├── projectService.ts
│   │   ├── projectMetadata.ts
│   │   └── syncService.ts
│   │
│   ├── concept/
│   │   ├── conceptService.ts
│   │   └── aiProvider.ts
│   │
│   ├── preview/
│   │   ├── previewService.ts
│   │   └── runtimeProvider.ts
│   │
│   ├── database/
│   │   ├── databaseService.ts
│   │   └── databaseViewProvider.ts
│   │
│   ├── views/
│   │   ├── projectsTreeProvider.ts
│   │   └── sharedProjectsTreeProvider.ts
│   │
│   └── security/
│       └── ...
│
├── media/
├── package.json
└── tsconfig.json
```

This structure is illustrative.

Recommend improvements if there is a more appropriate architecture.

Use clear boundaries such as:

```text
VS Code presentation
        |
Application/services
        |
Infrastructure/adapters
        |
Remote backend
```

Avoid creating one very large `extension.ts`.

---

# 17. Future Framework Support

Design framework support through explicit abstractions.

For example:

```text
ProjectRuntime
    |
    +-- VanillaRuntime
    |
    +-- ReactRuntime
```

Potential interface responsibilities:

```typescript
interface ProjectRuntime {
    initializeProject(...): Promise<void>;
    installDependencies(...): Promise<void>;
    startPreview(...): Promise<PreviewSession>;
    build(...): Promise<BuildResult>;
    stopPreview(...): Promise<void>;
}
```

CSS tooling could similarly be modeled separately:

```text
CssFramework
    |
    +-- Bootstrap
    |
    +-- Tailwind
```

Do not implement React/Tailwind in the first migration phase unless required for the architectural baseline.

The immediate goal is to ensure the architecture can support them later.

---

# 18. Security Requirements

Perform a dedicated threat/security assessment.

At minimum consider:

### Extension security

- authentication tokens
- SecretStorage
- untrusted workspaces
- command authorization
- filesystem boundaries
- remote content

### Preview security

- arbitrary project JavaScript
- iframe sandboxing
- CSP
- Node.js exposure
- extension API exposure
- cross-origin isolation
- message validation

### Webview security

Use restrictive Content Security Policies.

Never insert untrusted data directly into Webview HTML without correct escaping/sanitization.

Validate all messages crossing:

```text
Webview
   <->
Extension Host
```

### Backend security

Enforce:

```text
authentication
authorization
project membership
roles
resource ownership
request validation
rate limits where appropriate
audit-sensitive actions
```

### AI security

Do not expose model-provider credentials to user projects.

Prefer:

```text
Extension
   |
   v
Backend AI endpoint
   |
   v
LLM provider
```

instead of embedding provider secrets in the extension.

---

# 19. Migration Philosophy

Follow an incremental migration.

Do not attempt a complete rewrite in one step.

The existing Vanilla JS/Bootstrap capability should become the first supported project runtime.

A possible progression is:

```text
Phase 0
Architecture and current-system assessment

Phase 1
Minimal VS Code extension shell

Phase 2
Local project model

Phase 3
Vanilla JS/Bootstrap project support

Phase 4
Preview runtime

Phase 5
Authentication

Phase 6
Remote project API and synchronization

Phase 7
Project sharing and roles

Phase 8
Concept / GPT integration

Phase 9
Database explorer + CRUD

Phase 10
Security hardening

Phase 11
React runtime

Phase 12
Tailwind integration

Phase 13
Advanced collaboration / synchronization
```

Do not accept this sequence blindly.

Assess dependencies and recommend the safest implementation order.

Each phase should leave the extension in a usable/testable state.

---

# 20. Important Architectural Questions

Explicitly answer the following.

### A. Should VS Code replace the original browser application completely?

Discuss whether some functionality should remain web/backend-based.

### B. Should Design and Script remain conceptual tabs?

Or should they simply become ordinary project files?

### C. How should Concept be represented?

Compare:

```text
Markdown file
Webview
custom editor
sidebar
```

### D. How should Database be represented?

Identify which parts benefit from Webviews versus normal VS Code interfaces.

### E. How should Preview work?

Compare:

```text
Webview
embedded browser
local HTTP server
external browser
```

### F. How should projects be synchronized?

Compare:

```text
manual push/pull
automatic sync
Git-based synchronization
custom versioning
real-time collaboration
```

### G. How should Viewer access work locally?

If a Viewer receives project files on their machine, explain the limitations of preventing modification locally and distinguish that from preventing unauthorized remote updates.

### H. What should replace the current JavaScript IIFE guard?

Explain what it currently accomplishes and what proper isolation is required.

### I. Which functionality belongs inside the extension and which belongs on the server?

Provide explicit boundaries.

### J. How should React/Tailwind support later be added without changing the core extension?

Show the abstraction.

---

# 21. Required Output

Produce a detailed architecture assessment with the following sections.

## 1. Executive Summary

Explain the recommended direction and major architectural decisions.

## 2. Current Platform → VS Code Mapping

Provide a table similar to:

| Existing Capability | Current Implementation | Recommended VS Code Implementation |
|---|---|---|
| Preview | Browser tab | ? |
| Concept | GPT-assisted tab | ? |
| Design | HTML/CSS editor | ? |
| Script | JS editor | ? |
| Database | Graphical CRUD tab | ? |
| Authentication | Web login | ? |
| Projects | Remote account projects | ? |
| Sharing | Owner/editor/viewer | ? |

## 3. Proposed System Architecture

Include a Mermaid diagram.

For example, assess an architecture conceptually similar to:

```text
VS Code
   |
   v
Sandbox Extension
   |
   +--> Project Service
   +--> Preview Service
   +--> Concept Service
   +--> Database Service
   +--> Authentication Service
   +--> Synchronization Service
   |
   v
Backend API
   |
   +--> Authentication
   +--> Projects
   +--> Permissions
   +--> AI Gateway
   +--> Database API
   |
   v
Persistence
```

## 4. VS Code Extension Architecture

Describe:

- activation
- commands
- tree views
- Webviews
- services
- providers
- local storage
- secrets
- runtime abstraction

## 5. Project File Structure

Recommend the local project/workspace structure.

## 6. Backend Architecture

Describe APIs, authentication, authorization, project storage, sharing, database access and AI integration.

## 7. Authentication Flow

Provide a sequence diagram.

## 8. Project Synchronization Model

Explain local/remote ownership and conflict behavior.

## 9. Collaboration and Permission Model

Define OWNER / EDITOR / VIEWER permissions.

## 10. Preview Architecture

Explain execution, security and framework abstraction.

## 11. Concept / AI Architecture

Explain `/design`, prompt handling, AI provider abstraction and generated artifact storage.

## 12. Database Architecture

Explain graphical CRUD functionality and backend boundaries.

## 13. Security Assessment

Identify major risks and mitigations.

## 14. Framework Extensibility

Show how Vanilla JS, Bootstrap, React and Tailwind fit into the architecture.

## 15. Migration Plan

Break implementation into small, testable phases.

For every phase specify:

```text
Goal
Scope
Files/modules introduced
Files/modules modified
Files/modules that should NOT be modified
Expected behavior
Validation/tests
Exit criteria
```

## 16. Recommended Repository Structure

Show the proposed repository tree.

Consider whether the system should use something similar to:

```text
repo/
├── extension/
├── backend/
├── shared/
├── docs/
└── examples/
```

or whether separate repositories would be preferable.

Explain the trade-off.

## 17. Technology Recommendations

Recommend technologies for:

- VS Code extension language/runtime
- backend
- API protocol
- authentication
- persistence
- project file storage
- synchronization
- AI integration
- database UI
- automated testing

Avoid choosing technologies merely because they are popular. Relate each recommendation to the requirements.

## 18. Risks and Open Decisions

Identify architectural decisions that should be resolved before implementation.

## 19. Recommended First Implementation Phase

Finish by defining the **smallest practical first implementation phase**.

It should establish architectural boundaries without prematurely implementing:

- authentication
- cloud synchronization
- collaboration
- React
- Tailwind
- production AI integration
- production database integration

The first phase should result in something that can be launched and tested inside VS Code.

---

# 22. Constraints

Follow these rules throughout the assessment:

1. Do not perform a big-bang rewrite.
2. Preserve existing Vanilla JS/Bootstrap compatibility first.
3. Design for React/Tailwind without implementing them prematurely.
4. Prefer native VS Code functionality over Webviews when appropriate.
5. Do not treat Webviews as trusted environments.
6. Do not treat an IIFE as a security sandbox.
7. Do not store secrets in project files.
8. Backend authorization is authoritative.
9. Separate project runtime logic from VS Code UI logic.
10. Separate AI-provider-specific logic from Concept functionality.
11. Separate database-provider-specific logic from the extension UI.
12. Keep cloud-provider-specific code behind infrastructure interfaces where practical.
13. Prefer small modules with clear responsibilities over monolithic extension files.
14. Every proposed code-change phase must explicitly identify the files or modules that need to be added or edited.
15. Also identify important existing files/modules that should remain unchanged during each phase.
16. Do not start coding until the architecture assessment and phased migration plan have been completed.

The final result should be sufficiently concrete that the architecture document can subsequently be converted into a sequence of implementation prompts for Codex CLI.