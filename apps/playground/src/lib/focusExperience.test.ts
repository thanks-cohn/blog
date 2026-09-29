import { describe, expect, it } from "vitest";
import { chooseFocusSide, solveFocusComposition } from "./focusExperience";

describe("focusExperience", () => {
  it("derives text side from the object's existing position", () => {
    expect(chooseFocusSide(-2)).toBe("left");
    expect(chooseFocusSide(2)).toBe("right");
  });

  it("centers the camera and target on the selected object's current x/y", () => {
    const composition = solveFocusComposition({
      objectPosition: { x: 2.4, y: -0.7, z: 1.1 },
      objectRadius: 0.8,
      normalCameraDistance: 9
    });
    expect(composition.cameraOffsetX).toBe(2.4);
    expect(composition.cameraOffsetY).toBe(-0.7);
    expect(composition.targetOffsetX).toBe(2.4);
    expect(composition.targetOffsetY).toBe(-0.7);
    expect(composition.targetOffsetZ).toBe(1.1);
  });

  it("places the camera close in front of the selected object", () => {
    const composition = solveFocusComposition({
      objectPosition: { x: 0.5, y: 0, z: 1.4 },
      objectRadius: 1,
      normalCameraDistance: 9
    });
    const gap = composition.cameraDistance - 1.4;
    expect(gap).toBeGreaterThanOrEqual(1.15);
    expect(gap).toBeLessThanOrEqual(3.1);
    expect(composition.cameraDistance).toBeLessThan(9);
  });
});
