# AEXIS as the first WebRev consumer

The AEXIS website is the first real consumer used to prove WebRev.

## Expected AEXIS website shape

- `/` — cinematic/spatial product showcase
- `/play/` — browser-first AEXIS experience that does not require the extension
- `/wasm/` — experimental engine/runtime laboratory
- `/download/` — native desktop download
- `/substrate/` — browser extension
- `/.well-known/webrev.json` — discovery for agents/tools
- `/__webrev/*` — structured inspection data

## Spatial media system

The landing page should support reusable media panels capable of presenting:

- video
- images
- Sketchfab embeds
- arbitrary safe iframe embeds
- JavaScript experiences
- WASM experiences

Heavy media should support lazy/interaction-based loading.

A panel should expose a stable semantic identity so an agent can map the visible experience back to source/configuration/revision metadata.

## Asset plane

AEXIS is expected to use a dedicated CDN hostname such as:

`cdn.aexis.world`

Prefer the CDN for:
- video
- WASM
- GLB/models
- textures
- world data
- installers
- large immutable revisioned assets

The main site should remain lightweight and cache-friendly.

## Visual direction

AEXIS should feel like an exhibition of worlds rather than a generic SaaS website.

Think:
- spatial composition
- floating media planes
- restrained depth
- cinematic typography
- dark space / luminous worlds
- graceful low-power fallback
- deliberate motion, never required for usability

The visual layer is AEXIS-specific. The reusable media/revision/inspection contracts belong in WebRev.
