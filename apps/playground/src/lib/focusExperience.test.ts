import { describe, expect, it } from "vitest";
import { chooseFocusSide, focusCameraDistance, solveFocusComposition } from "./focusExperience";

describe("focusExperience", () => {
  it("derives the composition side from the object's existing position", () => {
    expect(chooseFocusSide(-2)).toBe("left");
    expect(chooseFocusSide(2)).toBe("right");
  });

  it("backs up farther when the current object position needs a larger composite frame", () => {
    const near = focusCameraDistance({
      objectRadius: 0.5,
      objectPosition: { x: 1, y: 0, z: 0.5 },
      aspect: 16 / 9
    });
    const far = focusCameraDistance({
      objectRadius: 1.5,
      objectPosition: { x: 4, y: 0, z: 2 },
      aspect: 16 / 9
    });
    expect(far).toBeGreaterThanOrEqual(near);
  });

  it("moves the camera toward the object without returning an object anchor", () => {
    const composition = solveFocusComposition({
      objectPosition: { x: 3, y: 0.4, z: 1 },
      objectRadius: 1,
      aspect: 16 / 9,
      normalCameraDistance: 9
    });
    expect(composition.side).toBe("right");
    expect(composition.cameraOffsetX).toBeGreaterThan(0);
    expect(composition.targetOffsetX).toBeGreaterThan(0);
    expect("anchor" in composition).toBe(false);
    expect(composition.textSide).toBe("left");
  });
});
