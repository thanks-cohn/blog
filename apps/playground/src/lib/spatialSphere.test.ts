import { describe, expect, it } from "vitest";
import {
  bodyFitsHemisphereSphere,
  cameraDistanceForPlacement,
  constrainBodyToHemisphereSphere,
  sphereFromCircumference,
  sphereFromDiameter,
  sphereFromRadius
} from "./spatialSphere";

describe("spatialSphere", () => {
  it("keeps diameter, radius, and circumference consistent", () => {
    const fromDiameter = sphereFromDiameter(12.8);
    expect(fromDiameter.radius).toBeCloseTo(6.4);
    expect(fromDiameter.circumference).toBeCloseTo(Math.PI * 12.8);

    const fromRadius = sphereFromRadius(6.4);
    expect(fromRadius.diameter).toBeCloseTo(12.8);

    const fromCircumference = sphereFromCircumference(Math.PI * 12.8);
    expect(fromCircumference.radius).toBeCloseTo(6.4);
  });

  it("never leaves the front hemisphere", () => {
    const next = constrainBodyToHemisphereSphere(
      {
        position: { x: 50, y: -20, z: -12 },
        velocity: { x: 8, y: -3, z: -4 }
      },
      "front",
      6.4,
      0.6,
      0.5
    );

    expect(bodyFitsHemisphereSphere(next.position, "front", 6.4, 0.6)).toBe(true);
  });

  it("never leaves the back hemisphere", () => {
    const next = constrainBodyToHemisphereSphere(
      {
        position: { x: -40, y: 13, z: 9 },
        velocity: { x: -7, y: 2, z: 5 }
      },
      "back",
      6.4,
      0.8,
      0.5
    );

    expect(bodyFitsHemisphereSphere(next.position, "back", 6.4, 0.8)).toBe(true);
  });

  it("keeps the entire body sphere inside the world sphere", () => {
    const bodyRadius = 1.1;
    const worldRadius = 6.4;
    const next = constrainBodyToHemisphereSphere(
      {
        position: { x: 30, y: 30, z: 30 },
        velocity: { x: 20, y: 20, z: 20 }
      },
      "front",
      worldRadius,
      bodyRadius,
      0.65
    );

    expect(Math.hypot(next.position.x, next.position.y, next.position.z) + bodyRadius)
      .toBeLessThanOrEqual(worldRadius + 1e-6);
  });

  it("keeps camera placement on the requested side of the sphere wall", () => {
    const radius = 6.4;
    expect(cameraDistanceForPlacement("inside", radius, 100)).toBeLessThan(radius);
    expect(cameraDistanceForPlacement("outside", radius, 1)).toBeGreaterThan(radius);
  });
});
