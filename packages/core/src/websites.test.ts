import { describe, expect, it } from "vitest";
import {
  listWebsites,
  resolveCategory,
  resolveResponsibility,
  type WebsitesConfig
} from "./websites";

const minimal: WebsitesConfig = {
  schemaVersion: 4,
  websites: {
    main: { origin: "https://example.test", categories: ["live"] },
    assets: { origin: "https://assets.example.test", categories: ["cdn"] }
  },
  defaults: { live: "main", cdn: "assets" }
};

describe("website resolution", () => {
  it("uses live as the general fallback", () => {
    expect(resolveCategory(minimal, "documentation").origin).toBe("https://example.test");
  });

  it("uses cdn for unspecified asset responsibilities", () => {
    expect(resolveResponsibility(minimal, "wasm")[0].origin)
      .toBe("https://assets.example.test");
  });

  it("prefers explicit responsibility providers", () => {
    const config: WebsitesConfig = {
      ...minimal,
      websites: {
        ...minimal.websites,
        wasm: { origin: "https://wasm.example.test", responsibilities: ["wasm"] }
      }
    };
    expect(resolveResponsibility(config, "wasm")[0].origin)
      .toBe("https://wasm.example.test");
  });

  it("routes one responsibility to multiple providers", () => {
    const config: WebsitesConfig = {
      schemaVersion: 4,
      websites: {
        main: { origin: "https://example.test", categories: ["live"] },
        cdnA: { origin: "https://a.example.test", categories: ["cdn"] },
        cdnB: { origin: "https://b.example.test", categories: ["cdn"] }
      },
      defaults: { live: "main", cdn: "cdnA" },
      routes: { video: ["cdnA", "cdnB"] }
    };
    expect(resolveResponsibility(config, "video").map((site) => site.origin))
      .toEqual(["https://a.example.test", "https://b.example.test"]);
  });

  it("supports many providers and excludes disabled ones", () => {
    const config: WebsitesConfig = {
      schemaVersion: 4,
      websites: {
        main: { origin: "https://example.test", categories: ["live"] },
        cdnA: { origin: "https://a.example.test", categories: ["cdn"], priority: 10 },
        cdnB: { origin: "https://b.example.test", categories: ["cdn"], priority: 20 },
        disabled: { origin: "https://off.example.test", categories: ["cdn"], enabled: false }
      },
      defaults: { live: "main" }
    };
    expect(listWebsites(config, "cdn").map(({ id }) => id)).toEqual(["cdnB", "cdnA"]);
  });

  it("falls assets back to live when no cdn exists", () => {
    const config: WebsitesConfig = {
      schemaVersion: 4,
      websites: { main: { origin: "https://example.test", categories: ["live"] } },
      defaults: { live: "main" }
    };
    expect(resolveResponsibility(config, "video")[0].origin)
      .toBe("https://example.test");
  });
});
