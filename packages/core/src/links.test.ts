import { describe, expect, it } from "vitest";
import { resolveLink, type LinksConfig } from "./links";

const config: LinksConfig = {
  schemaVersion: 1,
  links: {
    home: "",
    world: "world/",
    docs: "https://docs.example.test/",
    section: "#details"
  }
};

describe("link resolution", () => {
  it("resolves project-relative links against a deployment base", () => {
    expect(resolveLink(config, "world", "/WebRev/")).toBe("/WebRev/world/");
  });

  it("resolves the home link to the deployment base", () => {
    expect(resolveLink(config, "home", "/WebRev")).toBe("/WebRev/");
  });

  it("leaves absolute destinations unchanged", () => {
    expect(resolveLink(config, "docs", "/WebRev/")).toBe("https://docs.example.test/");
  });

  it("leaves fragment destinations unchanged", () => {
    expect(resolveLink(config, "section", "/WebRev/")).toBe("#details");
  });

  it("fails loudly for unknown semantic links", () => {
    expect(() => resolveLink(config, "missing")).toThrow(
      "WebRev link not configured: missing"
    );
  });
});
