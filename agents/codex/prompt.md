# Codex starter handoff for WebRev

You are working in the WebRev repository.

Before making architectural changes, read:

1. `/AGENTS.md`
2. `/docs/PRODUCT_SPEC.md`
3. `/docs/ARCHITECTURE.md`
4. `/docs/WEBSITES_CONFIG.md`
5. `/docs/AEXIS_HANDOFF.md`

## Goal

Continue building WebRev as an agent-first, reversible web application framework layer.

The first host is Astro. Do not fork Astro or replace Vite unless a concrete blocker proves it necessary.

The first real consumer is the AEXIS website, but WebRev core must remain generic.

## Immediate priorities

1. Make the initial scaffold build and test cleanly.
2. Keep revision identity structured and machine-readable.
3. Keep `/.well-known/webrev.json` as the discovery direction for WebRev-enabled sites.
4. Build inspection/invariant primitives as small generic interfaces.
5. Keep WASM experiments isolated from the primary site.
6. Keep deployment providers replaceable.
7. Treat Cloudflare Pages as the first production target while preserving GitHub deployment support.
8. Keep origins configurable through `config/websites.json`; do not hardcode deployable URLs elsewhere.

## Website resolution rule

The minimal topology is intentionally simple:

- `live` = the normal website/application origin.
- `cdn` = the broad asset/distribution origin.

Asset-like responsibilities should fall back to `cdn`.
If no CDN exists, they should fall back to `live`.

Specific responsibilities may override these broad categories later, but WebRev must not require users to model unnecessary granularity.

## Engineering constraint

If the framework already knows a fact that would help a programmer or coding agent debug the application, preserve it as structured data instead of forcing later inference.

## First deliverable

Produce a small, reviewable implementation that proves:

- revision identity
- machine-readable inspection
- one health/invariant primitive
- the website resolver fallback model
- isolated WASM lab behavior
- Cloudflare-compatible static build
- GitHub CI

Do not expand into a giant framework before this loop works end-to-end.
