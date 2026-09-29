export interface LinksConfig {
  schemaVersion: number;
  links: Record<string, string>;
}

function isAbsoluteTarget(target: string): boolean {
  return (
    /^https?:\/\//i.test(target) ||
    target.startsWith("//") ||
    target.startsWith("#") ||
    target.startsWith("mailto:") ||
    target.startsWith("tel:")
  );
}

function normalizeBase(base: string): string {
  if (!base || base === "/") return "/";
  return `/${base.replace(/^\/+|\/+$/g, "")}/`;
}

export function getLink(config: LinksConfig, key: string): string {
  const value = config.links[key];

  if (value === undefined) {
    throw new Error(`WebRev link not configured: ${key}`);
  }

  return value;
}

export function resolveLink(
  config: LinksConfig,
  key: string,
  base = "/"
): string {
  const target = getLink(config, key);

  if (isAbsoluteTarget(target)) {
    return target;
  }

  const normalizedBase = normalizeBase(base);
  const normalizedTarget = target.replace(/^\/+/, "");

  return normalizedTarget.length === 0
    ? normalizedBase
    : `${normalizedBase}${normalizedTarget}`;
}
