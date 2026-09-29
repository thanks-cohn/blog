# GitHub deployments

WebRev does not assume Cloudflare.

For GitHub Pages, use a GitHub Actions workflow that builds the same immutable revision and publishes the generated `dist` artifact. For other GitHub-driven deployments, a provider may use Actions, environments, releases, or another deployment target.

The important rule is that WebRev revision identity is independent from deployment provider identity.
