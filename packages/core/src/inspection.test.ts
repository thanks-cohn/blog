import { describe, expect, it } from "vitest";
import {
  createInspectionDocument,
  revisionIdentityInvariant,
  type WebRevRevision
} from "./index";

function revision(id: string): WebRevRevision {
  return { id, createdAt: "2026-01-01T00:00:00.000Z", configuration: {} };
}

describe("inspection documents", () => {
  it("reports an addressable revision as healthy", () => {
    const document = createInspectionDocument(revision("rev-123"), [
      revisionIdentityInvariant
    ]);

    expect(document).toMatchObject({
      schemaVersion: 1,
      framework: "webrev",
      revision: { id: "rev-123" },
      health: {
        state: "healthy",
        revision: "rev-123",
        checks: [{ id: "webrev.revision.identity", state: "healthy" }]
      }
    });
  });

  it("preserves an invariant failure as structured health", () => {
    const document = createInspectionDocument(revision(""), [
      revisionIdentityInvariant
    ]);

    expect(document.health.state).toBe("failed");
    expect(document.health.checks[0]).toMatchObject({
      id: "webrev.revision.identity",
      state: "failed"
    });
  });
});
