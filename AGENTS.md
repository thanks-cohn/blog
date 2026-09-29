# AGENTS.md — WebRev

WebRev is being designed as an agent-first, reversible web application framework layer.

## Mission

Build a framework in which websites and web applications are:

- inspectable
- testable
- reproducible
- revision-addressable
- easy to deploy
- easy to debug
- safe to rewind
- friendly to ordinary programmers
- exceptionally understandable to coding agents

The first host framework is Astro. Astro is a host, not the WebRev core.

## Core principle

> If a human can point at it, an agent should be able to address it.

Do not make agents infer information the framework already knows.

If WebRev knows which source file produced a route, which revision is live, which WASM artifact is loaded, which configuration is active, or which component failed, preserve and expose that information programmatically.

## Design laws

1. If it exists, it should have a stable identity when practical.
2. If it changes, it should have a revision.
3. If it depends on something, that dependency should be discoverable.
4. If it fails, the failure should identify what failed and where it came from.
5. Replaceable systems must sit behind explicit contracts.
6. Tests and invariants should be addressable.
7. Production-impacting changes should have a rollback path.
8. Heavy experimental runtimes must not be required for the primary site to function.
9. Immutable artifacts should be cacheable.
10. The debugging/control system must not depend on the thing it is trying to debug.
11. WebRev core must not depend on AEXIS-specific concepts.
12. WebRev core should not depend on Astro internals when a public integration or Vite hook can solve the problem.\n13. UI navigation must resolve semantic keys from `config/links.json`; do not scatter route or external URL literals through components.

## Initial architecture

WebRev has three conceptual planes:

### Data plane
Static/cacheable runtime output:
- HTML
- CSS
- JavaScript
- WASM
- media
- models
- textures
- revisioned artifacts

### Control plane
- revisions
- deployment
- promotion
- freeze
- rollback
- compatibility

### Observability plane
- health
- diagnostics
- invariants
- traces
- test results
- compatibility results
- sampled client failures

These planes must be independently replaceable where practical.

## First host

Use Astro as the first host.

Do not fork or copy Astro at this stage.

Prefer:
- Astro integration hooks
- Vite plugin hooks
- standard TypeScript APIs
- ordinary Astro routes
- static output where possible

The goal is to prove WebRev primitives while standing on mature web infrastructure.

## Initial package direction

Expected packages include:

- `@webrev/core`
- `@webrev/astro`
- future `@webrev/vite`
- future `@webrev/inspector`
- future `@webrev/invariants`
- future `@webrev/matrix`
- future `@webrev/deploy-cloudflare`
- future `@webrev/deploy-github`

Do not create empty packages purely to make the tree look complete. Add them when their first real contract or implementation exists.

## Deployment

Primary real-world target: Cloudflare Pages.

GitHub-hosted deployment must also be supported as a provider.

Deployment-provider details must not leak into `@webrev/core`.

Cloudflare-specific logic belongs behind an adapter/provider.

GitHub-specific logic belongs behind an adapter/provider.

## CDN model

WebRev must work cleanly with a separate immutable asset host such as:

`cdn.example.com`

Large/revisioned assets may include:
- videos
- WASM binaries
- models
- textures
- downloadable installers
- world data
- large static artifacts

The application/site origin should not need to serve every heavy asset directly.

## Agent discovery

A WebRev-enabled site should eventually expose a stable discovery entrypoint such as:

`/.well-known/webrev.json`

From that document, an authorized agent should be able to discover:
- current revision
- source metadata
- route tree
- component/system identities
- health
- diagnostics
- media/artifact map
- deployment/compatibility metadata where authorized

Production write operations must remain authenticated and auditable.

## WASM

WASM is an important proving ground, not a mandatory implementation detail.

Experimental WASM experiences should be isolated under a route such as:

`/wasm/`

The framework should support comparing configurations such as:
- JS/TS implementation
- WASM implementation
- low-memory WASM
- WebGL
- WebGPU
- threaded / non-threaded variants

A WASM failure must not take down the ordinary website.

## AEXIS relationship

AEXIS World will be the first demanding real-world consumer of WebRev.

Do not put AEXIS-specific engine assumptions into WebRev core.

AEXIS should consume WebRev, not define WebRev.

## Engineering style

Prefer:
- small explicit interfaces
- semantic names
- boring reliable primitives
- deterministic behavior
- structured errors
- JSON-serializable inspection data
- testable pure functions
- clear ownership of side effects

Avoid:
- hidden global state
- provider-specific logic in core
- framework-specific assumptions in generic packages
- magical auto-detection when an explicit contract is safer
- large abstractions without an immediate use case
- speculative rewrites of Astro/Vite

## First milestone

Build the smallest end-to-end WebRev loop:

1. Astro app starts.
2. WebRev assigns/reads a revision identity.
3. Build emits structured revision metadata.
4. Site exposes a machine-readable inspection endpoint.
5. A simple invariant can report healthy/failed.
6. A WASM lab route remains isolated.
7. Cloudflare Pages can deploy the static build.
8. GitHub Actions can build/test the same revision.
9. Tests verify the generic revision/invariant behavior.

When this works cleanly, expand toward:
- revision graph
- dependency graph
- richer agent inspection
- deployment providers
- configuration matrix testing
- partial/system-level rewind where compatibility permits

## Definition of success

A developer should be able to hand an agent:
- a repository
- a WebRev-enabled site URL
- or both

and the agent should be able to understand what is running, where it came from, what changed, what is unhealthy, and what safe next actions exist without blindly spelunking the codebase.


## Website origin configuration

Do not hardcode deployable website or CDN origins across source files.

Use `config/websites.json` as the canonical source of truth for named website roles.

Current deployable origins are defined only in `config/websites.json`.

Treat them as replaceable configuration, not framework constants.

Code should depend on semantic roles such as `primary` and `cdn`, plus their declared responsibilities, so responsibilities can move between origins without broad rewrites.


### Website responsibility model

A website may belong to multiple categories and own multiple responsibilities.

Do not model website roles as mutually exclusive enums.

Use:
- broad optional `categories` for common routing decisions
- optional granular `responsibilities` for specific capabilities
- `defaults` only to select the preferred provider for a category

Do not demand maximum granularity from small projects. The schema must support both simple two-origin sites and complex multi-origin deployments without redesign.
