# Website registry and routing

WebRev does not hardcode deployable origins throughout source code.

The canonical origin registry lives in `config/websites.json`.

## Goal

Adding or replacing infrastructure should normally be a configuration edit, not a repository clone, source-code rewrite, or application-wide search-and-replace.

A project may register one website or hundreds.

## Minimal configuration

A simple project only needs a live origin. If a CDN exists, add one broad `cdn` provider. Asset-like responsibilities automatically fall back to it.

## Registry model

Every entry has a stable ID and an origin.

Optional fields:
- `categories`: broad capabilities such as `live`, `cdn`, `api`, or `control`
- `responsibilities`: granular capabilities such as `video`, `wasm`, `models`, or `downloads`
- `priority`: ordering when several providers can perform the same job
- `enabled`: temporarily remove a provider without deleting it
- `metadata`: small provider-specific descriptive values

No category or responsibility is exclusive. One origin can perform many jobs.

## Routing

The optional `routes` map assigns a responsibility to one or more registered website IDs:

```json
{
  "routes": {
    "video": ["cdn-east", "cdn-west"],
    "wasm": "wasm-primary"
  }
}
```

Consumers still ask semantically:

```ts
resolveResponsibility(websites, "video")
```

They do not know or care which concrete origins currently provide it.

## Resolution order

1. explicit `routes[responsibility]`
2. entries declaring that responsibility
3. broad requested category, normally `cdn`
4. `live` as final fallback

This lets simple configurations remain simple while permitting granular infrastructure later.

## Operational principle

Changing CORS, DNS, providers, mirrors, or newly purchased domains should generally mean:

1. add/update the origin in `websites.json`
2. assign categories/responsibilities or a route
3. deploy configuration

No consumer rewrite should be required.

This follows WebRev's static-first rule: configuration changes topology; application modules consume semantic capabilities.
