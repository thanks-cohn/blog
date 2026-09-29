import { describe, expect, it } from "vitest";
import {
  hemisphereEditorCameraPosition,
  hemisphereEditorDistance,
  hemispherePresetDirection,
  lookAnglesAt,
  screenBasis
} from "./editLayer";

describe("editLayer hemisphere editor", () => {
  it("keeps editor distance bounded so the hemisphere remains useful on screen", () => {
    expect(hemisphereEditorDistance(6.4, 1)).toBeCloseTo(6.4 * 1.45);
    expect(hemisphereEditorDistance(6.4, 100)).toBeCloseTo(6.4 * 2.25);
  });

  it("mirrors front/back presets across the sphere", () => {
    const front = hemispherePresetDirection("top-left-down", "front");
    const back = hemispherePresetDirection("top-left-down", "back");
    expect(front.x).toBeCloseTo(back.x);
    expect(front.y).toBeCloseTo(back.y);
    expect(front.z).toBeCloseTo(-back.z);
  });

  it("keeps preset camera positions finite around the image center", () => {
    const center = { x: 1, y: 2, z: 3 };
    const position = hemisphereEditorCameraPosition(
      center,
      6.4,
      "bottom-corner-up",
      "front"
    );
    expect(Number.isFinite(position.x)).toBe(true);
    expect(Number.isFinite(position.y)).toBe(true);
    expect(Number.isFinite(position.z)).toBe(true);
  });

  it("keeps the side preset oblique enough to retain image context", () => {
    const side = hemispherePresetDirection("side", "front");
    expect(Math.abs(side.z)).toBeGreaterThan(0.35);
    expect(Math.abs(side.x)).toBeGreaterThan(Math.abs(side.z));
  });

  it("aims strong side cameras toward the image rather than away from it", () => {
    const target = { x: 0, y: 0, z: 0 };
    const camera = { x: 10, y: 0, z: 5.2 };
    const angles = lookAnglesAt(target, camera);

    const dx = target.x - camera.x;
    const dz = target.z - camera.z;
    const cy = Math.cos(-angles.yaw);
    const sy = Math.sin(-angles.yaw);
    const x1 = dx * cy - dz * sy;
    const z1 = dx * sy + dz * cy;

    expect(Math.abs(x1)).toBeLessThan(1e-9);
    expect(-z1).toBeGreaterThan(0);
  });

  it("produces valid look angles and screen basis toward the image", () => {
    const target = { x: 0, y: 0, z: 0 };
    const camera = { x: 5, y: 5, z: 8 };
    const angles = lookAnglesAt(target, camera);
    expect(Number.isFinite(angles.yaw)).toBe(true);
    expect(Number.isFinite(angles.pitch)).toBe(true);

    const basis = screenBasis(target, camera);
    expect(Math.hypot(basis.right.x, basis.right.y, basis.right.z)).toBeCloseTo(1);
    expect(Math.hypot(basis.up.x, basis.up.y, basis.up.z)).toBeCloseTo(1);
  });
});
