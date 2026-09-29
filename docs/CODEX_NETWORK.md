# Codex network access and CORS

This document intentionally refers to website roles from `config/websites.json` rather than repeating deployable origins.

## Codex cloud access

Giving Codex permission to inspect a deployed WebRev site is primarily a **Codex environment network-policy** question.

For a restricted Codex cloud environment, allow the hostnames used by the project, normally the origins assigned to:

- the `live` category
- the `cdn` category
- any separately assigned API or inspection origins

Prefer read-only HTTP methods (`GET`, `HEAD`, `OPTIONS`) when Codex only needs inspection.

Changing CORS headers on the website is not what grants Codex cloud outbound network access.

## Browser CORS

CORS becomes relevant when browser JavaScript running on one origin requests resources from another origin.

Common WebRev examples:

- browser `fetch()` from live origin to an API origin
- loading WASM with `fetch()` / `WebAssembly.instantiateStreaming()` from a CDN origin
- reading CDN images/video into canvas or WebGL
- cross-origin fonts
- browser-side inspection endpoints hosted on a different origin

For those resources, configure the serving origin with the narrowest suitable `Access-Control-Allow-Origin` policy.

For public immutable assets, allowing the live site origin is generally sufficient. Avoid allowing credentials unless the endpoint actually requires them.

## Agent-first recommendation

Keep read-only WebRev discovery and diagnostics available through the live origin whenever practical:

- `/.well-known/webrev.json`
- revision metadata
- route/system tree
- public health
- public artifact map

These can point to CDN or other origins.

This minimizes the number of network origins an inspection agent must reach.

Sensitive diagnostics and all write/control operations remain authenticated and should not be made public merely for agent convenience.
