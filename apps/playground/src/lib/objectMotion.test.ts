import { describe, expect, it } from "vitest";
import {
  clampOffsetToRange,
  fixedPositionAtTime,
  normalizeObjectMotion
} from "./objectMotion";

describe("objectMotion", () => {
  it("defaults unknown values to free floating", () => {
    expect(normalizeObjectMotion(undefined)).toEqual({ type: "free" });
  });

  it("keeps anchored fixed objects exactly at their anchor", () => {
    const anchor = { x: 2, y: -1, z: 4 };
    const motion = normalizeObjectMotion({
      type: "fixed",
      fixedMode: "anchored"
    });
    expect(motion.type).toBe("fixed");
    if (motion.type !== "fixed") return;
    expect(fixedPositionAtTime(anchor, motion, 2.3, 999)).toEqual(anchor);
  });

  it("never lets range-fixed behavior exceed its local range", () => {
    const anchor = { x: 1, y: 2, z: 3 };
    const motion = normalizeObjectMotion({
      type: "fixed",
      fixedMode: "range",
      range: 0.8,
      behavior: { type: "orbit", amplitude: 50, speed: 2 }
    });
    if (motion.type !== "fixed") return;
    const p = fixedPositionAtTime(anchor, motion, 0.7, 123.4);
    expect(Math.hypot(p.x - anchor.x, p.y - anchor.y, p.z - anchor.z))
      .toBeLessThanOrEqual(0.8 + 1e-9);
  });

  it("clamps arbitrary local offsets to a fixed range", () => {
    const p = clampOffsetToRange({ x: 10, y: -10, z: 5 }, 0.5);
    expect(Math.hypot(p.x, p.y, p.z)).toBeCloseTo(0.5);
  });
});
