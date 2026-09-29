import { describe, expect, it } from "vitest";
import { chooseFocusSide, focusCameraDistance, focusObjectAnchor } from "./focusExperience";

describe("focusExperience", () => {
  it("keeps the object on its current side when possible", () => {
    expect(chooseFocusSide(-2)).toBe("left");
    expect(chooseFocusSide(2)).toBe("right");
  });

  it("places the focused object outside the main image footprint", () => {
    const left = focusObjectAnchor("left", 1);
    const right = focusObjectAnchor("right", 1);
    expect(left.x).toBeLessThan(-2.7);
    expect(right.x).toBeGreaterThan(2.7);
  });

  it("backs the camera up farther for larger composite framing", () => {
    const near = focusCameraDistance({ objectRadius: 0.5, objectX: 3.5, aspect: 16 / 9 });
    const far = focusCameraDistance({ objectRadius: 1.5, objectX: 4.5, aspect: 16 / 9 });
    expect(far).toBeGreaterThan(near);
  });
});
