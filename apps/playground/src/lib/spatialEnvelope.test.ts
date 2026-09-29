import { describe, expect, it } from "vitest";
import {
  envelopesOverlap,
  normalizeSpatialEnvelopeConfig,
  resolveSphereCollision,
  spatialEnvelopeRadius
} from "./spatialEnvelope";

describe("spatialEnvelope", () => {
  it("derives one canonical radius from bounds, scale, and padding", () => {
    const config = normalizeSpatialEnvelopeConfig({ scale: 1.1, padding: 0.2 });
    expect(spatialEnvelopeRadius(1, config)).toBeCloseTo(1.3);
  });

  it("supports manual envelope radii", () => {
    const config = normalizeSpatialEnvelopeConfig({
      mode: "manual",
      radius: 2,
      scale: 0.5,
      padding: 0.1
    });
    expect(spatialEnvelopeRadius(99, config)).toBeCloseTo(1.1);
  });

  it("detects sphere overlap", () => {
    expect(envelopesOverlap(
      { center: { x: 0, y: 0, z: 0 }, radius: 1 },
      { center: { x: 1.5, y: 0, z: 0 }, radius: 1 }
    )).toBe(true);
  });

  it("separates dynamic bodies and changes approaching velocity", () => {
    const result = resolveSphereCollision(
      {
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 1, y: 0, z: 0 },
        radius: 1,
        mass: 1,
        response: "dynamic"
      },
      {
        position: { x: 1.2, y: 0, z: 0 },
        velocity: { x: -1, y: 0, z: 0 },
        radius: 1,
        mass: 1,
        response: "dynamic"
      },
      0.5
    );
    expect(result.collided).toBe(true);
    expect(result.b.position.x - result.a.position.x).toBeCloseTo(2);
    expect(result.a.velocity.x).toBeLessThan(1);
    expect(result.b.velocity.x).toBeGreaterThan(-1);
  });

  it("keeps immovable bodies fixed", () => {
    const result = resolveSphereCollision(
      {
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        radius: 1,
        mass: 1,
        response: "immovable"
      },
      {
        position: { x: 1.5, y: 0, z: 0 },
        velocity: { x: -1, y: 0, z: 0 },
        radius: 1,
        mass: 1,
        response: "dynamic"
      }
    );
    expect(result.a.position.x).toBe(0);
    expect(result.b.position.x).toBeCloseTo(2);
  });
});
