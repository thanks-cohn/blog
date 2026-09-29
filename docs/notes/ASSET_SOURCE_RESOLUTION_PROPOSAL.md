# Proposal: Source-Agnostic Asset Resolution for WebRev

**Status:** Proposal  
**Area:** Asset loading / scene composition / WebRev-AEXIS interoperability  
**Location:** `docs/notes/`

## Summary

WebRev should be able to compose a single scene, page, world, or experience from assets stored across multiple independent locations.

An asset's physical storage location should not determine how WebRev refers to or uses it.

A WebRev experience may therefore mix, for example:

- GLB/GLTF models hosted on Cloudflare R2
- GLB/GLTF models stored in GitHub
- 2D images bundled directly inside the repository
- textures or sprites hosted on another CDN
- local project assets
- audio/video media hosted remotely
- future AEXIS or Rolodex-managed assets

The engine should normalize all of these through one asset-resolution layer.

---

## Core Principle

World and scene definitions should reference **logical asset identities**, not hard-coded provider URLs whenever possible.

Instead of:

```ts
loadGLB("https://cdn.example.com/ships/nea.glb");
```

prefer:

```ts
webrev.asset("ship:nea");
```

The resolver determines where the asset currently lives and how it should be loaded.

This keeps content portable if assets later move between GitHub, Cloudflare, local storage, AEXIS infrastructure, or another provider.

---

## Proposed Architecture

```text
                 WebRev Scene / World
                         |
                    Asset ID
                  "ship:nea"
                         |
                  Asset Resolver
                         |
       +-----------------+------------------+
       |                 |                  |
   Local / Repo       Cloudflare          GitHub
       |                 |                  |
     GLB/PNG           GLB/PNG            GLB/PNG
       +-----------------+------------------+
                         |
                  Runtime Asset
```

The renderer and scene system should not need provider-specific logic.

Provider-specific behavior belongs in adapters/resolvers.

---

## Asset Manifest

A manifest can describe the logical asset and one or more possible sources.

Example:

```json
{
  "ship:nea": {
    "type": "model",
    "format": "glb",
    "sources": [
      {
        "provider": "cloudflare-r2",
        "url": "https://assets.example.com/ships/nea.glb"
      },
      {
        "provider": "github",
        "url": "https://raw.githubusercontent.com/example/assets/main/ships/nea.glb"
      },
      {
        "provider": "local",
        "url": "/assets/ships/nea.glb"
      }
    ]
  }
}
```

A simpler direct descriptor should also be valid:

```ts
{
  id: "grass_tile",
  type: "image",
  source: "local",
  url: "/assets/tiles/grass.png"
}
```

---

## Source Fallback

Multiple sources for one logical asset allow WebRev to degrade gracefully.

Suggested resolution order:

```text
Memory/cache
    |
Local project asset
    |
Primary remote source
    |
Configured fallback source
    |
Missing-asset placeholder / error
```

The exact source priority should be configurable per project and per asset.

Fallback should not silently substitute an asset with different content unless the manifest explicitly declares the sources equivalent.

---

## Supported Asset Families

The resolver should be generic rather than GLB-specific.

### 3D

- `.glb`
- `.gltf`
- textures
- environment maps
- animation files
- supporting binary buffers

### 2D

- PNG
- JPEG
- WebP
- SVG
- spritesheets
- tile assets
- Tiled-related resources

### Media

- MP3
- OGG
- WAV
- MP4
- WebM

### Data

- JSON
- Tiled JSON
- world definitions
- shader/source data
- metadata and manifests

Future formats should be addable through loader adapters without redesigning the resolver.

---

## Proposed Source Schemes

Internally, WebRev may expose normalized schemes such as:

```text
repo://
local://
github://
r2://
https://
aexis://
rolodex://
```

These are logical WebRev source schemes, not necessarily literal browser protocols.

They can resolve into normal URLs, local files, cached objects, signed URLs, or provider-specific requests at runtime.

Example:

```text
aexis://ships/nea
        |
        v
Asset Resolver
        |
        v
https://cdn.example.com/aexis/ships/nea.glb
```

---

## Browser Requirements

Remote browser-loaded assets must satisfy normal web security requirements.

### CORS

Remote providers must allow the WebRev origin to fetch required files.

Cloudflare R2/CDN endpoints should expose an appropriate CORS policy.

GitHub-hosted resources should use fetchable raw/release/static URLs rather than normal GitHub HTML page URLs.

### MIME Types

Providers should return correct content types for models, images, media, and binary data where possible.

### Authentication

Private assets may later resolve through:

- short-lived signed URLs
- authenticated provider adapters
- WebRev/AEXIS asset gateways

Credentials should never be embedded into world files.

---

## GitHub's Role

GitHub can serve as an asset source, particularly for:

- development assets
- small project resources
- version-controlled examples
- release artifacts
- static/raw resources

However, WebRev should not assume GitHub is the permanent high-volume asset CDN.

Large production assets can move to Cloudflare or another object/CDN provider without requiring scene/world references to change.

---

## Cloudflare / R2 Role

Cloudflare R2 is a natural provider for larger production assets because WebRev can control:

- CORS policy
- public or signed access
- cache behavior
- object organization
- custom domains
- delivery close to users

WebRev should still treat R2 as one provider among many rather than coupling its scene format directly to R2 URLs.

---

## Caching

The resolver should support caching independently of the source.

Potential layers:

1. in-memory runtime cache
2. browser cache / HTTP cache
3. IndexedDB or persistent WebRev cache
4. local desktop cache when WebRev runs in a desktop environment
5. future Rolodex/AEXIS managed cache

Logical asset IDs make cache keys stable even if the backing source changes.

For immutable/versioned assets, the manifest should optionally carry:

- version
- ETag
- checksum/hash
- byte size

Example:

```json
{
  "id": "ship:nea",
  "version": "4",
  "sha256": "...",
  "format": "glb"
}
```

---

## Integrity and Determinism

For AEXIS/world use, reproducibility matters.

An optional content hash should allow WebRev to verify that a remotely resolved asset is the expected asset.

A world can therefore state:

```text
ship:nea @ hash ABC123
```

rather than trusting that whatever currently occupies a URL is correct.

This is especially valuable when worlds depend on assets from different owners or providers.

---

## Rolodex / AEXIS Integration

This architecture should be compatible with a future Rolodex/AEXIS catalog.

A world may eventually contain mostly lightweight logical references:

```text
WORLD
 |
 +-- terrain:main
 +-- building:chapel
 +-- ship:nea
 +-- npc:merchant-01
 +-- music:descent-theme
```

Rolodex can resolve those identities to metadata and available locations:

```text
ship:nea
  -> Cloudflare R2 primary
  -> GitHub mirror
  -> local cached copy
```

This allows assets to be reorganized, mirrored, migrated, cached, or replaced at the infrastructure layer without rewriting every scene that references them.

---

## Example Mixed-Source Scene

A single WebRev page/world could legitimately contain:

```text
Scene: Floating Island

Terrain GLB       -> repo://models/island.glb
Ship GLB          -> r2://ships/nea.glb
Character GLB     -> github://characters/merchant.glb
Sky Texture       -> r2://textures/night-sky.webp
UI Icon           -> local://ui/enter-world.svg
Tile Map          -> repo://maps/world.tmj
Music             -> https://media.example.com/descent.ogg
```

All of these are presented to the rest of WebRev through the same resolver interface.

---

## Suggested API Direction

Conceptual API:

```ts
const asset = await webrev.assets.resolve("ship:nea");
const model = await webrev.assets.load("ship:nea");
```

Direct descriptors should also work:

```ts
await webrev.assets.load({
  type: "model",
  format: "glb",
  source: "https",
  url: "https://example.com/model.glb"
});
```

Provider registration:

```ts
webrev.assets.registerProvider("r2", r2Provider);
webrev.assets.registerProvider("github", githubProvider);
webrev.assets.registerProvider("aexis", aexisProvider);
```

The renderer should receive the resolved resource and remain unaware of how it was obtained.

---

## Error Handling

Resolution errors should distinguish at least:

- asset ID not found
- provider unavailable
- authentication required
- CORS/network failure
- unsupported format
- integrity/hash mismatch
- decode/parser failure
- all fallback sources exhausted

Development mode should report the attempted source chain clearly.

Production mode may render an asset-specific placeholder while recording the error.

---

## Non-Goals

This proposal does **not** require WebRev to:

- mirror every remote asset automatically
- make every remote provider publicly accessible
- use GitHub as a production CDN
- force all assets into Cloudflare
- duplicate every asset across providers
- expose provider credentials to scenes

The goal is source independence and interoperability.

---

## Recommended Initial Implementation

### Phase 1

Implement one common resolver supporting:

- repo/local paths
- ordinary HTTPS URLs
- Cloudflare/R2 URLs
- GitHub raw/release/static URLs
- GLB/GLTF
- common 2D image formats

### Phase 2

Add:

- manifest-based logical IDs
- configurable fallback chains
- caching
- hashes/integrity metadata
- structured resolver errors

### Phase 3

Add:

- `aexis://`
- `rolodex://`
- signed/private asset resolution
- provider plugins/adapters
- local desktop/project asset resolution
- asset migration without scene rewrites

---

## Design Rule

> **WebRev owns the identity of an asset; storage providers only own its current location.**

A WebRev world should be able to combine assets from different media types and storage systems without the world itself becoming coupled to any one of those systems.
