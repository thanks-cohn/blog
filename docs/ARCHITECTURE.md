# WebRev architecture

## Design law

WebRev components should be replaceable behind small, explicit contracts. A host framework may depend on WebRev; WebRev core must not depend on a host framework.

## First host

Astro is the first host because it provides routing, build tooling, static output, server rendering options, Vite integration, and UI-framework interoperability without forcing WebRev to own those systems.

## Planes

- **Data plane:** immutable HTML, JS, WASM, models, textures, and other cacheable artifacts.
- **Control plane:** revisions, promotions, freezes, deployments, rollbacks.
- **Observability plane:** diagnostics, traces, invariants, compatibility, sampled client failures.

These planes must be separable so a broken application does not disable its own repair tooling.

## Deployment providers

Cloudflare Pages is the first production target. GitHub Pages / GitHub Actions is a supported deployment path. Deployment providers must implement a common interface rather than leak provider behavior into WebRev core.

## Media panels

WebRev treats rich presentation as a generic panel contract. A panel may host video, Sketchfab, iframe content, JavaScript experiences, images, or WASM runtimes. Loading policy is explicit so experimental/heavy media cannot silently damage the primary page.

## WASM rule

`/wasm/` is an experimental boundary. The main website must remain usable if every WASM experience fails.
