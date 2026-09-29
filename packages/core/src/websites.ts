export interface WebsiteConfigEntry {
  origin: string;
  categories?: string[];
  responsibilities?: string[];
  enabled?: boolean;
  priority?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface WebsitesConfig {
  schemaVersion: number;
  websites: Record<string, WebsiteConfigEntry>;
  defaults?: Record<string, string>;
  routes?: Record<string, string | string[]>;
}

function enabledEntries(config: WebsitesConfig): Array<[string, WebsiteConfigEntry]> {
  return Object.entries(config.websites).filter(([, website]) => website.enabled !== false);
}

export function getWebsite(config: WebsitesConfig, websiteId: string): WebsiteConfigEntry {
  const website = config.websites[websiteId];
  if (!website) throw new Error(`WebRev website not configured: ${websiteId}`);
  if (website.enabled === false) throw new Error(`WebRev website is disabled: ${websiteId}`);
  return website;
}

export function getWebsiteOrigin(config: WebsitesConfig, websiteId: string): string {
  return getWebsite(config, websiteId).origin;
}

export function listWebsites(
  config: WebsitesConfig,
  category?: string
): Array<{ id: string; website: WebsiteConfigEntry }> {
  return enabledEntries(config)
    .filter(([, website]) => !category || website.categories?.includes(category))
    .map(([id, website]) => ({ id, website }))
    .sort((a, b) => (b.website.priority ?? 0) - (a.website.priority ?? 0));
}

export function resolveCategory(config: WebsitesConfig, category: string): WebsiteConfigEntry {
  const defaultWebsiteId = config.defaults?.[category];
  if (defaultWebsiteId) return getWebsite(config, defaultWebsiteId);

  const match = listWebsites(config, category)[0];
  if (match) return match.website;

  if (category !== "live") return resolveCategory(config, "live");
  throw new Error(`No WebRev website provides category: ${category}`);
}

export function resolveResponsibility(
  config: WebsitesConfig,
  responsibility: string,
  broadCategory = "cdn"
): WebsiteConfigEntry[] {
  const routed = config.routes?.[responsibility];

  if (routed) {
    const ids = Array.isArray(routed) ? routed : [routed];
    return ids.map((id) => getWebsite(config, id));
  }

  const specific = enabledEntries(config)
    .filter(([, website]) => website.responsibilities?.includes(responsibility))
    .sort(([, a], [, b]) => (b.priority ?? 0) - (a.priority ?? 0))
    .map(([, website]) => website);

  if (specific.length > 0) return specific;

  try {
    return [resolveCategory(config, broadCategory)];
  } catch {
    return [resolveCategory(config, "live")];
  }
}
