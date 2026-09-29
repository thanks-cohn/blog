# Semantic links

WebRev keeps navigational destinations in:

`config/links.json`

Application UI should refer to semantic keys instead of embedding route or external URL literals.

## Example

```json
{
  "schemaVersion": 1,
  "links": {
    "home": "",
    "world": "world/",
    "docs": "https://docs.example.com/"
  }
}
```

A component resolves a destination with the shared core helper:

```ts
resolveLink(linksConfig, "world", import.meta.env.BASE_URL)
```

## Why

The same source can be deployed at a project base path, a root custom domain, or another host without rewriting UI components.

Changing a destination should normally require only editing `config/links.json`.

For example, a game can move from a local route to a separate application origin without changing the button that opens it.

## Resolution rules

- relative values are resolved against the current deployment base
- absolute HTTP(S) destinations are returned unchanged
- fragment, mailto, and tel destinations are returned unchanged
- unknown semantic keys fail loudly

## Separation of concerns

`config/websites.json` answers:

> Which origins/providers perform infrastructure responsibilities?

`config/links.json` answers:

> Where should a semantic navigation action send the user?

Do not duplicate those decisions throughout components.
