# Cloudflare Pages

Primary WebRev hosting target.

Suggested Pages settings for the Astro static playground:

- Build command: `npm ci && npm run build`
- Build output directory: `apps/playground/dist`
- Production branch: `main`
- Preview deployments: enabled for pull requests

The first architecture deliberately produces static output so CDN caching is the default behavior. Dynamic APIs should be introduced as independent services rather than forcing all page requests through an origin.
