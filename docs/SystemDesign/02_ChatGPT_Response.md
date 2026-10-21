# VS Code Coding Sandbox — Architecture & Migration Assessment

ARCHITECTURE PROPOSAL · OCTOBER 2026 · VERSION 1.0

## 1. Executive summary

Recommendation: Rebuild the existing coding sandbox as a VS Code-native development platform, backed by an independent multi-user project service.

VS Code should replace the original web application's editing environment, but it should not replace the backend responsibilities for authentication, shared projects, permissions, persistent data, synchronization, and AI services.

The architecture should follow four principles:

1. VS Code owns the developer experience. Standard editors handle HTML, CSS, JavaScript, and eventually React/TypeScript. Custom extension components provide the project dashboard, previews, AI concept workflow, and database explorer.
2. Local project directories are the primary editing workspace. Remote synchronization is a separate, explicit service rather than a requirement of every file operation.
3. The backend owns identity and shared state. User permissions, project membership, remote revisions, database access, and AI credentials must be handled independently of the VS Code UI.
4. The platform is runtime-extensible. Vanilla JavaScript and Bootstrap are implemented first; React and Tailwind are introduced through runtime and project-template adapters.

RECOMMENDED PLATFORM SHAPE

Visual Studio Code

Code editors · workspace · terminal · source control

Sandbox Extension

Projects · Concept · Preview · Database · Sync

Local workspace

Files and runtime

Backend API

Users and projects

Persistent services

Project storage · Database · AI provider

### Primary architectural decisions

| Concern            | Recommendation                                    |
| ------------------ | ------------------------------------------------- |
| Extension language | TypeScript                                        |
| Extension host     | VS Code desktop, Node.js extension host initially |
| Project format     | Normal local directories                          |
| Initial framework  | Vanilla JS + Bootstrap                            |
| Future frameworks  | React + Tailwind                                  |
| UI strategy        | Native views first, Webviews only where necessary |
| Preview            | Local runtime with a browser preview              |
| AI Concept         | Markdown artifact with command-driven generation  |
| Database           | Tree view + graphical CRUD editor                 |
| Authentication     | Browser login using OAuth/OIDC with PKCE          |
| Synchronization    | Revision-aware explicit push/pull initially       |
| Collaboration      | Backend-managed OWNER / EDITOR / VIEWER roles     |
| Repository         | TypeScript monorepo initially                     |

The VS Code documentation supports this approach: native Tree Views are intended for structured data, while custom Webviews are recommended only when native UI is insufficient.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code Extension API

+2



## 2. Existing platform → VS Code mapping

The five original capabilities should remain identifiable to existing users, but each should use the most appropriate VS Code interface.

| Existing capability | VS Code implementation           | Key behavior                          |
| ------------------- | -------------------------------- | ------------------------------------- |
| Preview             | Browser preview / Webview Panel  | Display running application           |
| Concept             | Markdown file + AI command       | Generate and edit application concept |
| Design              | Native HTML/CSS/TSX editors      | Develop presentation layer            |
| Script              | Native JS/TS editors             | Develop application behavior          |
| Database            | Tree View + CRUD Webview         | Browse and modify project data        |
| Authentication      | Extension authentication service | Sign in and restore sessions          |
| My Projects         | Sidebar Tree View                | Open and manage projects              |
| Shared Projects     | Sidebar Tree View                | Access editor/viewer projects         |
| Collaboration       | Commands + backend API           | Manage project membership             |
| Synchronization     | Extension service + status bar   | Pull, push and resolve conflicts      |

### Proposed VS Code experience

Visual Studio Code — Sandbox Workspace

SANDBOX

&#x20;My Projects

　 Furniture Configurator

　 Customer Portal

&#x20;Shared With Me

　 Inventory Manager

EXPLORER

　 src

　　 index.html

　　 styles.css

　　 script.js

　 concept.md

index.html

script.js

concept.md

Preview

01　\<!DOCTYPE html>

02　\<html lang="en">

03　　\<head>...\</head>

04　　\<body>

05　　　\<main id="app">

06　　　　\<h1>My Application\</h1>

07　　　\</main>

08　　\</body>

09　\</html>

OUTPUT · Sandbox Runtime

Project loaded: Furniture Configurator

Runtime: vanilla

Preview: ready

Conceptual interface only

&#x20;Local workspace

This arrangement preserves the original workflow without unnecessarily recreating a second code editor inside VS Code.

## 3. Proposed system architecture

The platform should be divided into four architectural layers.

Layer 1 — VS Code Presentation

Project Explorer

Native Code Editors

Concept Commands

Preview UI

Database UI

Status / Notifications

Layer 2 — Extension Application Services

ProjectService

PreviewService

ConceptService

AuthService

DatabaseService

SyncService

Layer 3 — Infrastructure and Adapters

LocalFileStore

RemoteProjectApi

RuntimeProvider

CredentialStore

AiProvider

DatabaseApi

Layer 4 — Backend Services

Authentication

Project API

Role Authorization

Version / Sync API

AI Gateway

Database API

SQL Database

·

Object Storage

·

LLM Provider

The most important rule is that presentation components should not directly implement persistence, cloud logic, or permission policy.

A command should invoke an application service, which invokes an appropriate adapter. The extension's view layer should not know which cloud database provider is used.

## 4. VS Code extension architecture

### 4.1 Activation and registration

The entry point should be intentionally small.

`extension/src/extension.ts` should only orchestrate:

- service construction and dependency injection,
- command registration,
- view provider registration,
- lifecycle and disposal,
- environment initialization.

Do not place project synchronization logic, authentication, or preview rendering inside this file.

The initial extension needs a small set of commands such as:

| Command ID                | User-facing title         |
| ------------------------- | ------------------------- |
| `sandbox.createProject`   | Sandbox: Create Project   |
| `sandbox.openProject`     | Sandbox: Open Project     |
| `sandbox.startPreview`    | Sandbox: Start Preview    |
| `sandbox.stopPreview`     | Sandbox: Stop Preview     |
| `sandbox.openConcept`     | Sandbox: Open Concept     |
| `sandbox.generateConcept` | Sandbox: Generate Concept |
| `sandbox.signIn`          | Sandbox: Sign In          |
| `sandbox.pullProject`     | Sandbox: Pull Project     |
| `sandbox.pushProject`     | Sandbox: Push Changes     |
| `sandbox.openDatabase`    | Sandbox: Open Database    |

Commands should be registered progressively as the corresponding capabilities are implemented.

### 4.2 VS Code API decisions

| API                          | Usage                                                    |
| ---------------------------- | -------------------------------------------------------- |
| `TreeDataProvider`           | My Projects, Shared With Me, database entities           |
| `workspace.fs`               | Workspace file operations                                |
| `window.createWebviewPanel`  | Custom database grid and suitable preview views          |
| `window.createOutputChannel` | Runtime and synchronization diagnostics                  |
| `window.createStatusBarItem` | Active project and synchronization state                 |
| `ExtensionContext.secrets`   | Sensitive locally held credentials                       |
| `authentication` namespace   | Integrate with VS Code session patterns when appropriate |
| `workspace.isTrusted`        | Gate executable project operations                       |

A desktop-first extension is sensible because preview and build runners may need Node.js and local processes. Supporting VS Code for the Web or fully remote extension hosts later is a distinct compatibility milestone: their execution and filesystem capabilities differ.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code Extension API

+2



## 5. Project representation and local file structure

Use real project directories, not virtual documents, as the default.

### Vanilla JavaScript + Bootstrap

```
furniture-configurator/
├── .sandbox/
│   ├── project.json
│   ├── concept.md
│   └── database.schema.json
├── src/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── assets/
├── package.json
└── README.md
```

### Future React + Tailwind

```
customer-portal/
├── .sandbox/
│   ├── project.json
│   ├── concept.md
│   └── database.schema.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── components/
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

The `.sandbox` directory is the platform-specific project descriptor, while the rest should remain ordinary application code.

### Project metadata

```
{
  "schemaVersion": 1,
  "projectId": "project-uuid",
  "name": "Furniture Configurator",
  "runtime": "vanilla",
  "styling": "bootstrap",
  "remote": {
    "projectId": "remote-project-uuid"
  }
}
```

Avoid embedding credentials, local absolute paths, or device-specific settings in this descriptor.

The remote revision should normally be tracked in local synchronization metadata, rather than treated as a portable part of the project source.

## 6. Backend architecture

The backend should remain independent from VS Code so that the same project service can eventually support another web client, CLI, or automation service.

### Core backend domains

| Domain          | Responsibility                                   |
| --------------- | ------------------------------------------------ |
| Identity        | Validate identity-provider tokens and sessions   |
| Projects        | Ownership, metadata and lifecycle                |
| Membership      | Invitations and role management                  |
| File Storage    | Versioned project source snapshots               |
| Synchronization | Revision comparison and conflict detection       |
| AI Gateway      | Validate and process concept-generation requests |
| Database API    | Authorized project data access                   |
| Audit           | Security-relevant user actions                   |

### Recommended persistence separation

Relational database: Users, projects, project members, project revisions, invitations, audit metadata, and possibly application data.

Object storage: Source file snapshots, asset files, attachments, and larger versioned project artifacts.

Identity provider: User login and account sessions, rather than storing user passwords directly in the new service.

### Suggested API boundaries

```
GET    /v1/projects
POST   /v1/projects
GET    /v1/projects/{projectId}
PATCH  /v1/projects/{projectId}
DELETE /v1/projects/{projectId}

GET    /v1/projects/{projectId}/members
POST   /v1/projects/{projectId}/invitations
PATCH  /v1/projects/{projectId}/members/{userId}
DELETE /v1/projects/{projectId}/members/{userId}

GET    /v1/projects/{projectId}/manifest
POST   /v1/projects/{projectId}/revisions

POST   /v1/projects/{projectId}/concept/generate

GET    /v1/projects/{projectId}/database/tables
GET    /v1/projects/{projectId}/database/tables/{table}/rows
POST   /v1/projects/{projectId}/database/tables/{table}/rows
PATCH  /v1/projects/{projectId}/database/tables/{table}/rows/{rowId}
DELETE /v1/projects/{projectId}/database/tables/{table}/rows/{rowId}
```

For project revisions, require a parent revision or optimistic-concurrency precondition. A successful upload should create an immutable revision and update the project head atomically.

Database resource names and operations must be validated against the project's authorized schema, not interpolated directly into arbitrary database queries.

## 7. Authentication architecture

### Recommended approach

Use browser-based OAuth 2.0 / OpenID Connect with Authorization Code + PKCE, using an identity provider compatible with the backend.

Authentication should belong to an `AuthService` abstraction, not individual commands or views.

Sandbox BackendIdentity ProviderBrowserVS Code ExtensionSandbox BackendIdentity ProviderBrowserVS Code Extension#chatgpt-mermaid-\_r_65n\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_65n\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_65n\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_65n\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_65n\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_65n\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_65n\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_65n\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_65n\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_65n\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_65n\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_65n\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_65n\_ p{margin:0;}#chatgpt-mermaid-\_r_65n\_ .actor{stroke:rgb(83, 154, 248);fill:rgb(222, 234, 251);stroke-width:1;}#chatgpt-mermaid-\_r_65n\_ rect.actor.outer-path[data-look="neo"]{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ rect.note[data-look="neo"]{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ text.actor>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_65n\_ .actor-line{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ .innerArc{stroke-width:1.5;stroke-dasharray:none;}#chatgpt-mermaid-\_r_65n\_ .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ [id$="-arrowhead"] path{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ .sequenceNumber{fill:#707070;}#chatgpt-mermaid-\_r_65n\_ [id$="-sequencenumber"]{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ [id$="-crosshead"] path{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_65n\_ .messageText{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_65n\_ .labelBox{stroke:rgba(0, 0, 0, 0.1);fill:rgb(252, 252, 252);filter:none;}#chatgpt-mermaid-\_r_65n\_ .labelText,#chatgpt-mermaid-\_r_65n\_ .labelText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_65n\_ .loopText,#chatgpt-mermaid-\_r_65n\_ .loopText>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_65n\_ .sectionTitle,#chatgpt-mermaid-\_r_65n\_ .sectionTitle>tspan{fill:rgb(13, 13, 13);stroke:none;}#chatgpt-mermaid-\_r_65n\_ .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:rgba(0, 0, 0, 0.1);fill:rgba(0, 0, 0, 0.1);}#chatgpt-mermaid-\_r_65n\_ .note{stroke:rgb(107, 198, 127);fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_65n\_ .noteText,#chatgpt-mermaid-\_r_65n\_ .noteText>tspan{fill:rgb(13, 13, 13);stroke:none;font-weight:normal;}#chatgpt-mermaid-\_r_65n\_ .activation0{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_65n\_ .activation1{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_65n\_ .activation2{fill:rgb(243, 243, 243);stroke:hsl(0, 0%, 85.2941176471%);}#chatgpt-mermaid-\_r_65n\_ .actorPopupMenu{position:absolute;}#chatgpt-mermaid-\_r_65n\_ .actorPopupMenuPanel{position:absolute;fill:rgb(222, 234, 251);box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#chatgpt-mermaid-\_r_65n\_ .actor-man circle,#chatgpt-mermaid-\_r_65n\_ line{fill:rgb(222, 234, 251);stroke-width:2px;}#chatgpt-mermaid-\_r_65n\_ g rect.rect{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_65n\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_65n\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_65n\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_65n\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_65n\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_65n\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_65n\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}UserSign InGenerate PKCE verifier and stateOpen authorization URLAuthenticate userAuthorization codeRegistered callback URIValidate stateExchange code using PKCEAuthenticated sessionCall API with access tokenValidate token and authorizationAuthorized project listDisplay projectsUser

The identity provider, token audience, callback registration, and backend token validation must be configured together. If the backend uses an additional token exchange, that should be an explicit part of the protocol.

Store only the necessary credentials in VS Code SecretStorage. Use normal extension state for non-sensitive account display metadata.

The VS Code Authentication API supports provider-based sessions, while SecretStorage is available for extension-managed sensitive state.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code Extension API

+1



### Required session behavior

| Event                  | Extension behavior                         |
| ---------------------- | ------------------------------------------ |
| First sign-in          | Launch browser authorization               |
| Restart VS Code        | Restore or renew valid session             |
| Access token expires   | Refresh through authorized mechanism       |
| Refresh fails          | Require sign-in                            |
| User signs out         | Clear local credentials                    |
| Project access revoked | Deny subsequent remote operations          |
| Offline operation      | Permit local editing as policy allows      |
| Switch account         | Revalidate project access for new identity |

An account's identity must never be inferred from locally editable project metadata.

## 8. Local and remote synchronization

This is one of the most important architectural changes from the original browser application.

In the original system, the server likely acted as the immediate storage environment. In the proposed system, local files and remote project revisions are separate states.

### Recommended initial model

Local

Workspace files

Working changes

Base revision

Local metadata

Remote

Project versions

Shared state

Member permissions

Project artifacts

Revision-aware SyncService

Compare · Push · Pull · Conflict detection · Revision tracking

### Synchronization states

| State          | Meaning                                         | Action                                 |
| -------------- | ----------------------------------------------- | -------------------------------------- |
| Clean          | Local matches the base revision and remote head | None                                   |
| Modified       | Unsynchronized local changes                    | Push                                   |
| Remote Updated | New remote revision, no conflicting local edits | Pull                                   |
| Diverged       | Local modifications and new remote revisions    | Resolve conflicts                      |
| Offline        | Remote API unavailable                          | Continue permitted local work          |
| Forbidden      | User lacks permission for requested operation   | Reject remote write                    |
| Deleted        | Remote project removed                          | Preserve local files, reconcile status |

### Recommended conflict policy

Use an explicit base revision.

When pushing:

1. Determine local changes relative to the base revision.
2. Send the expected parent revision.
3. Backend checks current remote head.
4. If it matches, atomically publish the new revision.
5. If it differs, return a conflict rather than silently replacing remote content.

For the MVP, resolve conflicts at the file level. Text-aware three-way merges may be introduced later.

A revision should represent an immutable project-file snapshot or a reproducible manifest of content-addressed files.

### Git versus application synchronization

Git is excellent for developer-oriented version history and merging. However, it does not directly implement the account-based permission and application-database model described in the existing platform.

My recommendation is:

- Use Git optionally for local source history.
- Use backend-managed project revisions for platform synchronization.
- Keep the synchronization interface replaceable.
- Avoid implementing live multi-user editing initially.

### Important restriction for Viewers

A Viewer who downloads project source onto their machine can modify their local copy using VS Code or another editor. A desktop extension cannot reliably stop this.

The enforceable guarantee is:

Viewers must not be allowed to push modifications or mutate protected remote project resources.

If a project owner must prevent source disclosure entirely, a downloadable local workspace is not an appropriate viewer experience. Such projects would need a remote preview-only access mode.

## 9. Collaboration and permission model

### Recommended authorization matrix

| Operation               | Owner | Editor       | Viewer          |
| ----------------------- | ----- | ------------ | --------------- |
| View project metadata   | Yes   | Yes          | Yes             |
| Read project source     | Yes   | Yes          | Yes             |
| View preview            | Yes   | Yes          | Yes             |
| Edit source locally     | Yes   | Yes          | Local copy only |
| Push source revisions   | Yes   | Yes          | No              |
| Read database records   | Yes   | Yes          | Configurable    |
| Modify database records | Yes   | Configurable | No              |
| Generate AI concepts    | Yes   | Yes          | No              |
| Invite members          | Yes   | No           | No              |
| Change roles            | Yes   | No           | No              |
| Remove members          | Yes   | No           | No              |
| Delete remote project   | Yes   | No           | No              |

This is the recommended initial policy, not a claim that the existing platform already enforces every detail.

### Suggested data model

\#chatgpt-mermaid-\_r_66g\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_66g\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_66g\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_66g\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_66g\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66g\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_66g\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_66g\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_66g\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_66g\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_66g\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_66g\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66g\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66g\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_66g\_ p{margin:0;}#chatgpt-mermaid-\_r_66g\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_66g\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_66g\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_66g\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_66g\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_66g\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_66g\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66g\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_66g\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66g\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_66g\_ .node rect,#chatgpt-mermaid-\_r_66g\_ .node circle,#chatgpt-mermaid-\_r_66g\_ .node ellipse,#chatgpt-mermaid-\_r_66g\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_66g\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_66g\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_66g\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_66g\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_66g\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_66g\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_66g\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_66g\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66g\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_66g\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66g\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}USERSuuididPKstringidentity_subjectstringdisplay_namePROJECTSuuididPKuuidowner_idFKstringnameuuidhead_revision_idPROJECT_MEMBERSuuidproject_idFKuuiduser_idFKstringrolePROJECT_REVISIONSuuididPKuuidproject_idFKuuidparent_revision_iduuidcreated_byFKstringmanifest_refPROJECT_INVITATIONSuuididPKuuidproject_idFKstringinviteestringrolestringstatusownsparticipatesgrantscontainscreatesoffers

Membership uniqueness, ownership consistency, revision ancestry, and invitation expiration must be handled through database constraints and backend transactions.

Do not rely on a role cached in the extension to authorize a mutation. Every backend write should validate the caller's effective permissions.

## 10. Preview architecture and sandboxing

### Recommendation

Use a `ProjectRuntime` abstraction to launch the relevant project preview. Keep the Preview UI separate from the application being previewed.

\#chatgpt-mermaid-\_r_66p\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_66p\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_66p\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_66p\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_66p\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_66p\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_66p\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_66p\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_66p\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_66p\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66p\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66p\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_66p\_ p{margin:0;}#chatgpt-mermaid-\_r_66p\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_66p\_ .label text,#chatgpt-mermaid-\_r_66p\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ .node rect,#chatgpt-mermaid-\_r_66p\_ .node circle,#chatgpt-mermaid-\_r_66p\_ .node ellipse,#chatgpt-mermaid-\_r_66p\_ .node polygon,#chatgpt-mermaid-\_r_66p\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .rough-node .label text,#chatgpt-mermaid-\_r_66p\_ .node .label text,#chatgpt-mermaid-\_r_66p\_ .image-shape .label,#chatgpt-mermaid-\_r_66p\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_66p\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .rough-node .label,#chatgpt-mermaid-\_r_66p\_ .node .label,#chatgpt-mermaid-\_r_66p\_ .image-shape .label,#chatgpt-mermaid-\_r_66p\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_66p\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_66p\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66p\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66p\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_66p\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_66p\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_66p\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_66p\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_66p\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_66p\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_66p\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_66p\_ .icon-shape,#chatgpt-mermaid-\_r_66p\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_66p\_ .icon-shape p,#chatgpt-mermaid-\_r_66p\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_66p\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_66p\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_66p\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_66p\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_66p\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_66p\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_66p\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_66p\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_66p\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66p\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_66p\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_66p\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_66p\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_66p\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_66p\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_66p\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .node rect,#chatgpt-mermaid-\_r_66p\_ .node circle,#chatgpt-mermaid-\_r_66p\_ .node ellipse,#chatgpt-mermaid-\_r_66p\_ .node polygon,#chatgpt-mermaid-\_r_66p\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_66p\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_66p\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_66p\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_66p\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_66p\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}Preview CommandPreviewServiceProjectRuntime RegistryVanilla RuntimeReact Runtime - FuturePreview Process / ServerIsolated Preview OriginBrowser Preview

For Vanilla JavaScript, this may be a small controlled local HTTP server serving the project.

For React, a Vite-based development runtime can manage dependency resolution and hot module replacement.

Do not run arbitrary project JavaScript directly inside the privileged extension context.

### Why the current IIFE is insufficient

Your current wrapper:

```
(function () {
  // Application code
})();
```

primarily creates a function scope, limiting some accidental name collisions. It does not prevent the script from accessing ambient browser APIs or making network requests.

An isolated preview is a separate architectural requirement.

### Minimum security policy

The preview should have:

- a separate untrusted execution context;
- a deliberately configured origin and CSP;
- no direct access to extension tokens, project credentials, or VS Code APIs;
- a tightly scoped message protocol if host interaction is necessary;
- constrained filesystem exposure;
- no automatic execution of project-provided shell commands in untrusted workspaces.

A VS Code Webview is not, by itself, a guarantee that arbitrary preview code has been safely isolated. The extension's own Webview UI also needs a restrictive CSP, limited resource roots, and validated messages.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code Extension API

+1



### Additional browser consideration

A local server is not automatically isolated just because it binds to `127.0.0.1`.

For untrusted project code, a stronger design is to put the application on a separate preview origin and keep the control API on a different origin, with no reusable secrets exposed to the application. Cross-origin and cross-site protections, request validation, and loopback-server defenses must be assessed together.

A secure-by-default preview requires a dedicated threat-model and implementation review before executing third-party projects.

## 11. Concept and GPT architecture

The original `/design` functionality should remain recognizable.

I recommend storing generated concepts as Markdown documents, while initiating generation through an extension command.

### Proposed flow

\#chatgpt-mermaid-\_r_67h\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_67h\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_67h\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_67h\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_67h\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_67h\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_67h\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_67h\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_67h\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_67h\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_67h\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_67h\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:16px;}#chatgpt-mermaid-\_r_67h\_ p{margin:0;}#chatgpt-mermaid-\_r_67h\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_67h\_ .label text,#chatgpt-mermaid-\_r_67h\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ .node rect,#chatgpt-mermaid-\_r_67h\_ .node circle,#chatgpt-mermaid-\_r_67h\_ .node ellipse,#chatgpt-mermaid-\_r_67h\_ .node polygon,#chatgpt-mermaid-\_r_67h\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .rough-node .label text,#chatgpt-mermaid-\_r_67h\_ .node .label text,#chatgpt-mermaid-\_r_67h\_ .image-shape .label,#chatgpt-mermaid-\_r_67h\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_67h\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .rough-node .label,#chatgpt-mermaid-\_r_67h\_ .node .label,#chatgpt-mermaid-\_r_67h\_ .image-shape .label,#chatgpt-mermaid-\_r_67h\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_67h\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_67h\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_67h\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_67h\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_67h\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_67h\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_67h\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_67h\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_67h\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_67h\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_67h\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_67h\_ .icon-shape,#chatgpt-mermaid-\_r_67h\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_67h\_ .icon-shape p,#chatgpt-mermaid-\_r_67h\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_67h\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_67h\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_67h\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_67h\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_67h\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_67h\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_67h\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_67h\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_67h\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_67h\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_67h\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_67h\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_67h\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_67h\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_67h\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_67h\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .node rect,#chatgpt-mermaid-\_r_67h\_ .node circle,#chatgpt-mermaid-\_r_67h\_ .node ellipse,#chatgpt-mermaid-\_r_67h\_ .node polygon,#chatgpt-mermaid-\_r_67h\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_67h\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_67h\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2px,2px;}#chatgpt-mermaid-\_r_67h\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_67h\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_67h\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,Segoe UI,Helvetica,Apple Color Emoji,Arial,sans-serif,Segoe UI Emoji,Segoe UI Symbol;}User describes application/design or Generate ConceptConceptServiceAI Backend GatewayLLM ProviderGenerated ConceptConcept ReviewSave concept.md

### Suggested concept structure

```
# Project Concept

## Objective
Describe the purpose of the application.

## Users and Roles
Identify expected user categories.

## Functional Requirements
Document required features.

## User Interfaces
Describe screens and interactions.

## Workflows
Describe business processes.

## Data Model
List entities and relationships.

## Technical Considerations
Describe constraints and dependencies.

## Open Questions
List unresolved decisions.
```

### Provider architecture

```
interface ConceptProvider {
  generateConcept(
    request: ConceptGenerationRequest
  ): Promise<ConceptGenerationResult>;
}
```

Initially implement a `MockConceptProvider` that returns a deterministic example.

Later add a `BackendConceptProvider` that invokes the authenticated backend AI gateway.

Generated content should be previewed or diffed before overwriting an existing concept. Preserve source prompts or revision history when useful, but avoid silently publishing potentially sensitive prompts to shared project history.

### `/design` command interpretation

A normal VS Code command such as `Sandbox: Generate Concept` should be the default invocation. Supporting `/design` inside a dedicated AI interaction view can be added separately.

Do not assume arbitrary text typed into the native code editor automatically triggers `/design`.

## 12. Database architecture

The Database capability is the strongest candidate for a hybrid native/custom UI.

### Proposed experience

Project Database

TABLES

&#x20;users

&#x20;products

&#x20;settings

products

3 rows

| ID | Name     | Price  |
| -- | -------- | ------ |
| 1  | Headrest | 120.00 |
| 2  | Footrest | 95.00  |
| 3  | Backrest | 180.00 |

Illustrative table records

Recommended split:

| Component          | Responsibility                            |
| ------------------ | ----------------------------------------- |
| Database Tree View | List tables and collections               |
| Database Webview   | Table/grid UI, forms, sorting, pagination |
| DatabaseService    | Application-level CRUD operations         |
| DatabaseApiClient  | Authenticated API requests                |
| Backend            | Query validation, permissions, auditing   |
| Storage Adapter    | Actual database queries and transactions  |

### Essential open decision: What does Database mean?

There are two different potential models:

Model A — Database as development tooling. The extension browses a separately hosted application's database. The preview application uses its own authorized application API.

Model B — Database as a managed sandbox capability. Every project receives scoped data storage, and the platform provides controlled application-facing CRUD operations.

Because the original platform exposes database CRUD directly, Model B may be closer to the intended product. However, the uploaded specification does not establish the existing database engine, schema model, or application-to-database access contract.

I recommend designing a database provider interface now, but deferring the concrete database architecture until those details are established.

For production, the data seen by an editor and data accessed by an end-user preview should have distinct permissions. For example, editing database records as a project owner should not imply that anonymous application visitors may edit them.

## 13. Security assessment

The platform has two distinct trust boundaries: untrusted project code executing near a developer's local environment and multiple remote users accessing shared project resources.

Both require explicit protection.

| Risk                         | Severity    | Recommended mitigation                               |
| ---------------------------- | ----------- | ---------------------------------------------------- |
| Untrusted project JavaScript | Critical    | Isolated preview execution                           |
| Unauthorized remote writes   | Critical    | Server-side project-role enforcement                 |
| Token leakage into preview   | Critical    | Separate auth context, no secrets in project content |
| Malicious Webview messages   | High        | Validate message schemas and authorization           |
| Arbitrary local file access  | High        | Restrict paths and approved workspace operations     |
| Local process execution      | High        | Workspace Trust and explicit user consent            |
| Preview localhost abuse      | High        | Origin restrictions, request validation              |
| Synchronization data loss    | High        | Immutable revisions, conflict detection              |
| AI prompt injection          | Medium–High | Treat generated content as untrusted                 |
| Database misuse              | High        | Resource-level authorization and bounded queries     |
| Malicious dependencies       | High        | Dependency/build-script trust controls               |

Workspace Trust should not be an afterthought. VS Code explicitly supports restricted workspace behavior and warns that UI command visibility is not sufficient to prevent command execution.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code Extension API



### Security acceptance gates

Before production use with shared or third-party projects, verify that:

- project preview code cannot read extension secrets;
- project code cannot invoke privileged extension operations without authorization;
- all backend mutations require valid identity and project permissions;
- remote revision conflicts cannot silently overwrite content;
- a revoked Editor cannot continue uploading changes;
- database CRUD is restricted to authorized project resources;
- untrusted Webview messages cannot trigger arbitrary file or process operations.

## 14. Framework extensibility

I recommend separating project runtime from project scaffolding and styling configuration.

React is a runtime/build-tooling concern. Tailwind and Bootstrap are styling choices. They should not be represented as mutually dependent platform modes.

### Runtime contract

```
interface ProjectRuntime {
  readonly id: string;

  initializeProject(
    context: ProjectContext
  ): Promise<void>;

  installDependencies(
    context: ProjectContext
  ): Promise<void>;

  startPreview(
    context: ProjectContext
  ): Promise<PreviewSession>;

  build(
    context: ProjectContext
  ): Promise<BuildResult>;

  stopPreview(
    session: PreviewSession
  ): Promise<void>;
}
```

The exact types should be finalized during implementation. Operations such as installing dependencies or running builds must pass through a process-execution policy rather than being trusted merely because a runtime adapter requested them.

### Runtime registry

```
ProjectRuntimeRegistry
│
├── VanillaRuntime
│   ├── HTML
│   ├── CSS
│   └── JavaScript
│
└── ReactRuntime (Future)
    ├── Vite
    ├── React
    ├── TypeScript / JavaScript
    └── HMR
```

### Styling configuration

```
StylingProfile
│
├── PlainCSS
├── Bootstrap
└── Tailwind (Future)
```

For example, these combinations should eventually be possible:

| Runtime | Styling   | Intended support |
| ------- | --------- | ---------------- |
| Vanilla | Bootstrap | Initial          |
| Vanilla | Plain CSS | Initial          |
| React   | Tailwind  | Future           |
| React   | Plain CSS | Future           |
| React   | Bootstrap | Optional future  |

A template registry can define supported combinations without hardcoding each combination into the core extension.

## 15. Migration plan

I recommend adjusting the tentative phase sequence in the uploaded specification.

In particular, security controls for local file operations and previews must be developed alongside those capabilities, not postponed to a late hardening phase.

IMPLEMENTATION ROADMAP

0

Architecture & legacy assessment

Architecture baseline

1

VS Code extension shell

First build

Runnable extension

2

Local project model

Workspace management

3

Vanilla JS / Bootstrap runtime

Project scaffolding

4

Isolated preview

Running application preview

5

Authentication

Signed-in sessions

6

Remote project API

Remote project access

7

Revision-aware synchronization

Safe push and pull

8

Sharing and permissions

Owner / Editor / Viewer

9

Concept / GPT

AI-assisted concept generation

10

Graphical database

Authorized CRUD

11

Production security and release

Production candidate

12

React and Tailwind

Framework expansion

13

Advanced collaboration

Optional real-time capabilities

### Phase implementation specifications

The filenames below are proposed files, not claims that those files already exist. Their purpose is to give each future Codex task a precise and bounded scope.

Phase 0 — Architecture and existing-platform assessment

Goal: Establish a migration contract before writing extension code.

Add: `docs/architecture/system.md`, `docs/architecture/security.md`, `docs/migration/legacy-inventory.md`, `docs/migration/phase-plan.md`.

Modify: None.

Do not modify: Existing Google Cloud application, scripts, database or deployment configuration.

Expected behavior: Documentation identifies the current database format, legacy project serialization, authentication provider, and export strategy.

Validation and exit: Every existing capability is mapped to a target component, with unresolved facts explicitly recorded.

Phase 1 — Minimal VS Code extension shell

Goal: Launch a functional extension with a custom Sandbox sidebar and working commands.

Add: `extension/package.json`, `extension/tsconfig.json`, `extension/src/extension.ts`, `extension/src/views/projectsTreeProvider.ts`, `extension/src/commands/projectCommands.ts`, `extension/src/services/projectService.ts`, `extension/src/test/extension.test.ts`, `extension/.vscode/launch.json`.

Modify: Root `package.json` for monorepo scripts, if used.

Do not modify: Backend services, authentication, preview runtime, database modules.

Expected behavior: VS Code opens an Extension Development Host, shows the Sandbox sidebar and executes a basic command.

Validation and exit: Typecheck, unit tests and extension-host smoke test pass; no backend required.

Phase 2 — Local project model

Goal: Create, open and validate conventional project directories.

Add: `extension/src/projects/projectMetadata.ts`, `projectRepository.ts`, `projectTemplates.ts`; `shared/src/projectSchema.ts`; `examples/vanilla-bootstrap/`.

Modify: `projectService.ts`, `projectCommands.ts`, `projectsTreeProvider.ts`.

Do not modify: Remote APIs and authentication.

Expected behavior: A local project can be created and reopened after restarting VS Code.

Validation and exit: Metadata validation, duplicate handling, safe-path tests, and round-trip reopen tests pass.

Phase 3 — Vanilla JS / Bootstrap runtime

Goal: Establish the initial project runtime without launching untrusted code automatically.

Add: `extension/src/runtime/projectRuntime.ts`, `runtimeRegistry.ts`, `vanillaRuntime.ts`, `runtimeExecutionPolicy.ts`.

Modify: Project template files, `projectMetadata.ts`, `projectService.ts`.

Do not modify: Authentication, sync, collaboration.

Expected behavior: Projects declare a runtime and scaffold valid HTML, CSS and JavaScript.

Validation and exit: Runtime selection tests, template tests and build-fixture checks pass.

Phase 4 — Isolated Preview

Goal: Display a functioning local project without giving its code extension privileges.

Add: `extension/src/preview/previewService.ts`, `previewPanel.ts`, `previewServer.ts`, `previewSecurityPolicy.ts`, `commands/previewCommands.ts`.

Modify: `vanillaRuntime.ts`, `extension.ts`, extension command contributions.

Do not modify: Remote storage, membership logic.

Expected behavior: Start/stop preview works, changes can trigger reload, and runtime errors are displayed.

Validation and exit: Verify origin isolation, workspace trust checks, CSP, server cleanup, and privileged-API denial using hostile test fixtures.

Phase 5 — Authentication

Goal: Sign in through a configured identity provider.

Add: `extension/src/auth/authService.ts`, `authProviderAdapter.ts`, `sessionStore.ts`, `commands/authCommands.ts`; backend auth middleware.

Modify: `extension.ts`, extension commands and views.

Do not modify: Project runtime, preview execution policy.

Expected behavior: Login, session restoration, logout and expired-token handling work.

Validation and exit: PKCE/state validation, callback handling, credential storage and revoked-session tests pass.

Phase 6 — Remote project API

Goal: Retrieve remote projects and membership metadata without synchronizing local modifications yet.

Add: `backend/src/projects/`, `backend/src/memberships/`, `backend/src/storage/`, `extension/src/api/apiClient.ts`, `projectApi.ts`.

Modify: `projectService.ts`, `projectsTreeProvider.ts`.

Do not modify: Preview renderer, runtime adapters.

Expected behavior: My Projects and Shared With Me are populated from authorized API responses.

Validation and exit: API contract, filtering, pagination, cross-user denial and mock-backend integration tests pass.

Phase 7 — Revision-aware synchronization

Goal: Safely pull and push project source.

Add: `extension/src/sync/syncService.ts`, `revisionStore.ts`, `conflictResolver.ts`; backend revision endpoints; shared revision schemas.

Modify: Project repository, API client, project commands and status integration.

Do not modify: Preview and authentication-provider internals.

Expected behavior: Remote projects can be downloaded; authorized changes can be uploaded.

Validation and exit: Stale-base uploads are rejected, offline modifications persist, and conflicts preserve both local and remote data.

Phase 8 — Sharing and roles

Goal: Enable OWNER, EDITOR and VIEWER workflows.

Add: `backend/src/authorization/`, invitation handlers, `extension/src/sharing/sharingService.ts`, `sharingCommands.ts`.

Modify: Backend project routes, synchronization authorization checks, project views.

Do not modify: Runtime plugins.

Expected behavior: Owners can invite collaborators; editors can publish changes; viewers cannot publish.

Validation and exit: Complete permission-matrix integration tests pass, including revoked access.

Phase 9 — Concept / GPT

Goal: Introduce `/design` concept generation.

Add: `extension/src/concept/conceptService.ts`, `conceptProvider.ts`, `mockConceptProvider.ts`, `backendConceptProvider.ts`; backend AI gateway.

Modify: Concept command registration and project template.

Do not modify: Preview execution or synchronization rules, except through existing service APIs.

Expected behavior: Users can generate, review and save a concept document.

Validation and exit: Provider mocking, error handling, overwrite protection, permissions and secret non-disclosure tests pass.

Phase 10 — Graphical Database

Goal: Browse project tables and perform authorized CRUD.

Add: `extension/src/database/databaseService.ts`, `databaseTreeProvider.ts`, `databasePanel.ts`; database API adapter, backend database routes, Webview assets.

Modify: Extension view contributions and backend authorization rules.

Do not modify: Source runtime implementations.

Expected behavior: Users can inspect permitted tables, edit records and see validation errors.

Validation and exit: CRUD, pagination, injection defense, per-role access checks and Webview message validation tests pass.

Phase 11 — Production security and release

Goal: Review the complete security model and produce a release candidate.

Add: Security integration tests, release workflows, extension packaging scripts, threat-model updates.

Modify: Components found deficient during the review.

Do not modify: Public contracts without versioned migration.

Expected behavior: A packaged extension connects to a production-like backend.

Validation and exit: Security gates, migration tests, automated regression suite, and manual release checklist pass.

Phase 12 — React and Tailwind

Goal: Extend supported project types without changing core workflows.

Add: `extension/src/runtime/reactRuntime.ts`, React templates, Tailwind styling profile and test fixtures.

Modify: Runtime registry, template registry and compatibility declarations.

Do not modify: Auth, collaboration or shared-project authorization.

Expected behavior: React projects can be created, built and previewed using the existing project services.

Validation and exit: React HMR, dependency lifecycle, builds, styling and synchronization tests pass.

Phase 13 — Advanced collaboration

Goal: Introduce optional live collaboration when justified by product usage.

Add: Collaboration event protocol, presence adapters, concurrent-editing engine if selected.

Modify: Sync service and backend collaboration infrastructure.

Do not modify: Basic project formats unless a versioned schema change is necessary.

Expected behavior: Multiple authorized editors can collaborate with recoverable conflict behavior.

Validation and exit: Concurrent editing, reconnect, revocation, and consistency tests pass.

This plan deliberately treats the backend and advanced collaboration as separate deliverables. A functioning local extension should not require the entire cloud infrastructure to exist first.

## 16. Recommended repository structure

A monorepo is the best initial choice because the extension, backend and shared contracts will evolve together.

```
sandbox-platform/
├── extension/
│   ├── src/
│   │   ├── extension.ts
│   │   ├── commands/
│   │   ├── views/
│   │   ├── services/
│   │   ├── projects/
│   │   ├── runtime/
│   │   ├── preview/
│   │   ├── auth/
│   │   ├── api/
│   │   ├── sync/
│   │   ├── sharing/
│   │   ├── concept/
│   │   ├── database/
│   │   └── test/
│   ├── media/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── memberships/
│   │   ├── revisions/
│   │   ├── database/
│   │   ├── ai/
│   │   └── storage/
│   └── package.json
│
├── shared/
│   └── src/
│       ├── projectSchema.ts
│       ├── apiContracts.ts
│       ├── permissions.ts
│       └── revisionSchema.ts
│
├── examples/
│   ├── vanilla-bootstrap/
│   └── react-tailwind/
│
├── docs/
│   ├── architecture/
│   ├── migration/
│   ├── security/
│   └── phases/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

The shared package should contain portable contracts, types, and validation schemas, not server implementation internals.

Why monorepo first? It simplifies contract changes, automated testing, and coordinated releases. Separate repositories can be introduced later if the extension and backend develop independent ownership or deployment lifecycles.

## 17. Technology recommendations

| Area                | Proposed technology                         | Reason                                               |
| ------------------- | ------------------------------------------- | ---------------------------------------------------- |
| VS Code extension   | TypeScript + VS Code Extension API          | Direct support for required extension capabilities   |
| UI                  | Native VS Code views                        | Familiar interface and lower maintenance             |
| Custom UI           | Small React Webviews where appropriate      | Suitable for interactive database grids              |
| Project runtime     | Node.js adapter-based runners               | Support for local Vanilla and future React tooling   |
| React tooling       | Vite                                        | Development server and build workflow                |
| API                 | REST over HTTPS                             | Straightforward project and CRUD contracts           |
| Contract validation | Zod or equivalent                           | Runtime request and metadata validation              |
| Backend             | TypeScript on Node.js or Cloudflare Workers | Share contracts with extension                       |
| Authentication      | OAuth/OIDC provider with PKCE               | Avoid password handling in extension                 |
| Relational storage  | PostgreSQL or Cloudflare D1                 | Strong candidate for membership and project metadata |
| Artifact storage    | Cloud object storage                        | Suitable for project snapshots and assets            |
| AI                  | Backend provider adapter                    | Protect API credentials and support provider changes |
| Testing             | Vitest + VS Code integration testing        | Unit tests plus real extension-host verification     |
| Package management  | pnpm workspaces                             | Monorepo dependency organization                     |

Cloudflare is a reasonable deployment candidate if you want to move away from Google Cloud. Workers, D1, and R2 could cover the API, relational metadata, and source-artifact storage respectively. However, the choice should depend on data size, transaction patterns, database requirements and expected hosting costs.

For extension tests, the current official VS Code guidance supports `@vscode/test-cli` and `@vscode/test-electron`.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code Extension API



I would not commit to a specific cloud provider or database product in Phase 1. That would prematurely couple the VS Code migration to infrastructure choices.

## 18. Risks and open architectural decisions

The uploaded specification establishes the desired product behavior, but some existing-system details remain unknown. These should be investigated during Phase 0 instead of guessed.

| Decision                 | Recommended default                  | What needs confirmation                        |
| ------------------------ | ------------------------------------ | ---------------------------------------------- |
| Existing project export  | Convert to ordinary files            | How projects are currently serialized          |
| Existing database model  | Abstract through DatabaseService     | Current database engine and schema             |
| Existing user identities | Preserve accounts when feasible      | Identity provider and migration options        |
| Preview hosting          | Local isolated preview               | Whether untrusted third-party code is expected |
| Sync mechanism           | Explicit revisions                   | Expected collaboration frequency               |
| Sharing UX               | Download source for authorized users | Whether viewers may receive source             |
| Application data access  | Separate application-facing API      | How current scripts access database data       |
| AI integration           | Backend concept gateway              | Model provider, prompts and output format      |
| Desktop support          | Windows, Linux, macOS                | Whether web/remote VS Code is a requirement    |
| Cloud deployment         | Provider-independent interfaces      | Cost, compliance and regional constraints      |

### Architecture decisions to resolve first

The three decisions with the greatest downstream impact are:

1\. Project storage format. A sample of an existing project's persisted HTML, CSS, JavaScript, Concept and database information is needed to design a lossless migration.

2\. Database contract. The platform must distinguish database-administration operations from operations executed by the application itself. This affects both its backend and its security architecture.

3\. Preview trust model. Code written exclusively by a trusted developer is a different risk category from arbitrary code downloaded from another platform user. The latter requires stronger isolation and a clear policy about running local processes.

## 19. Recommended first implementation phase

I recommend beginning with Phase 1 — Minimal VS Code Extension Shell, after the Phase 0 architecture documents are accepted.

Phase 1 should not use real authentication, cloud storage, GPT APIs or a project database.

## Phase 1 acceptance criteria

First milestone

Target: A runnable VS Code extension with an organized codebase and no dependency on external services.

Extension launches in the Extension Development Host

Sandbox Activity Bar container is visible

My Projects tree view renders mock projects

Shared With Me renders mock shared projects

A project command executes successfully

Services are separated from VS Code UI providers

No live backend or credentials are required

Unit and extension-host smoke tests pass

0 of 8 acceptance criteria verified

Reset

### Implementation order within Phase 1

1. Initialize the root TypeScript monorepo.
2. Scaffold the extension package and Extension Development Host launch configuration.
3. Implement the minimal `extension.ts` entry point.
4. Create a mock project repository and project service.
5. Register My Projects and Shared With Me tree providers.
6. Register a working command to open or display mock project details.
7. Add unit and VS Code integration tests.
8. Document the architecture boundaries and verify that no backend dependencies have leaked into the presentation layer.

### Suggested first Codex command prompt

# Implementation Prompt — Phase 1: VS Code Extension Shell

Implement Phase 1 of the approved Sandbox Platform architecture.

## Objective

Create a minimal, runnable Visual Studio Code extension using TypeScript.

The extension shall provide a custom Sandbox Activity Bar container with two project Tree Views: "My Projects" and "Shared With Me".

Use a mock project repository containing deterministic example projects.

## Architecture

Follow these boundaries:

VS Code UI → Application Services → Repository Interfaces → Mock Adapters

Keep `extension.ts` minimal and use separate modules for commands, services, tree providers, and repository implementations.

## Required functionality

- Launch the extension using F5 in VS Code.
- Show the Sandbox icon in the Activity Bar.
- Display mock projects in both project views.
- Register `sandbox.openProject`.
- Execute the command when a mock project is selected.
- Display the selected project's metadata.
- Include an OutputChannel for diagnostics.
- Support clean disposal of registered resources.

## Constraints

Do not implement authentication, backend access, cloud synchronization, GPT integration, database CRUD, preview execution, React, or Tailwind.

Do not embed secrets or provider-specific code.

Do not modify any existing legacy sandbox application.

## Implementation process

1. Inspect the existing repository.
2. Identify existing files that can be reused.
3. Present the exact files to add or modify.
4. Implement the minimal extension.
5. Add unit tests and extension-host integration tests.
6. Run TypeScript compilation and test commands.
7. Report results and unresolved issues.

## Exit criteria

The extension launches in the VS Code Extension Development Host, registers both Tree Views, displays mock projects, and executes a project command successfully.

Provide a final summary listing every added or modified file, validation results, and any remaining limitations.

Do not begin Phase 2.

## Final architecture recommendation

The proposed migration is technically well suited to a VS Code extension, provided it is treated as a platform restructuring rather than a UI port.

The five existing concepts remain valid:

- Design and Script become ordinary project source files.
- Concept becomes an AI-assisted, reviewable document.
- Preview becomes an isolated project runtime with a browser-oriented viewing experience.
- Database becomes a graphical extension interface backed by a permission-aware API.

The largest engineering challenges are unlikely to be the VS Code interface itself. They will be safely executing project code, migrating the original project format, synchronizing local and remote changes, and ensuring that shared-project permissions are consistently enforced.

The recommended immediate deliverable is therefore a minimal extension shell with explicit architectural boundaries, followed by local project support and an isolated Vanilla JavaScript preview. That provides a testable foundation before adding cloud services and collaboration.