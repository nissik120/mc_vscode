# ADR 0003: Defer Authentication Provider Selection

- Status: Accepted
- Date: 2026-11-18

## Context

The platform needs authenticated project access, but the authentication provider is explicitly undecided. No existing provider configuration or legacy account model is present in this repository to assess compatibility.

## Decision

Do not select, configure, or implement an authentication provider in Phase 0. Design the extension and backend around a provider-neutral session/identity boundary. Firebase Authentication is a candidate and may be evaluated later, but is not selected by this ADR.

The eventual choice must support browser-based VS Code authentication, verified backend identity, secure token/session lifecycle, account switching, revocation, and a viable legacy account-linking/migration approach. Where appropriate, use OAuth 2.0/OIDC Authorization Code with PKCE; protocol details depend on the selected provider.

## Consequences

Local project, preview, and mock concept work can proceed without premature provider lock-in. Authenticated remote features cannot be completed until a provider and account migration strategy are approved. Implementation must not embed credentials in webviews, project files, or normal extension state; secrets belong in VS Code SecretStorage and provider keys remain backend-side.

## Alternatives considered

- Select Firebase Authentication immediately: rejected because the user explicitly left the choice open and no legacy compatibility evidence is available.
- Build custom password authentication: rejected because it expands security and account-management risk without a stated need.
