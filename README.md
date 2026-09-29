# WebRev

**Build forward. Rewind safely.**

WebRev is an experimental, agent-first web framework layer for making websites and web applications easier to inspect, test, compare, deploy, debug, and rewind.

The first host framework is Astro. Astro is a host, not WebRev's core: the reusable WebRev contracts live in independent packages so other runtimes can be supported later.

## Initial goals

- Every build has a stable revision identity.
- Every important subsystem can expose health and diagnostics.
- Deployment providers are replaceable.
- Cloudflare Pages is the first production target.
- GitHub deployments are supported without coupling WebRev to GitHub.
- WASM experiments live behind an isolated `/wasm/` boundary.
- An agent can inspect structured application state instead of guessing from logs.
- The main site must remain healthy even when experimental runtimes fail.

## Status

Early architecture scaffold. The first proving ground will be the AEXIS website and its browser/WASM experiments.
