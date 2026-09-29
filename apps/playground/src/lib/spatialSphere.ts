export type Hemisphere = "front" | "back";
export type CameraPlacement = "inside" | "outside";

export type Vec3 = { x: number; y: number; z: number };

export type SphereGeometry = {
  diameter: number;
  radius: number;
  circumference: number;
};

export type BodyState = {
  position: Vec3;
  velocity: Vec3;
};

const TAU = Math.PI * 2;

function finitePositive(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function sphereFromDiameter(diameter: number): SphereGeometry {
  const safeDiameter = Math.max(0.2, finitePositive(diameter, 12.8));
  const radius = safeDiameter / 2;
  return {
    diameter: safeDiameter,
    radius,
    circumference: TAU * radius
  };
}

export function sphereFromRadius(radius: number): SphereGeometry {
  const safeRadius = Math.max(0.1, finitePositive(radius, 6.4));
  return sphereFromDiameter(safeRadius * 2);
}

export function sphereFromCircumference(circumference: number): SphereGeometry {
  const safeCircumference = Math.max(0.2 * Math.PI, finitePositive(circumference, 12.8 * Math.PI));
  return sphereFromRadius(safeCircumference / TAU);
}

export function maxBodyRadiusForSphere(sphereRadius: number) {
  return Math.max(0.01, sphereRadius * 0.49);
}

export function cameraDistanceForPlacement(
  placement: CameraPlacement,
  sphereRadius: number,
  requestedDistance?: number
) {
  const radius = Math.max(0.1, sphereRadius);
  const fallback = placement === "inside" ? radius * 0.62 : radius * 1.42;
  const requested = finitePositive(Number(requestedDistance), fallback);

  if (placement === "inside") {
    return Math.max(0.2, Math.min(radius * 0.9, requested));
  }

  return Math.max(radius * 1.12, requested);
}

export function constrainBodyToHemisphereSphere(
  state: BodyState,
  hemisphere: Hemisphere,
  sphereRadius: number,
  bodyRadius = 0,
  restitution = 0.5
): BodyState {
  const radius = Math.max(0.1, finitePositive(sphereRadius, 6.4));
  const safeBodyRadius = Math.min(
    Math.max(0, Number.isFinite(bodyRadius) ? bodyRadius : 0),
    maxBodyRadiusForSphere(radius)
  );
  const centerLimit = Math.max(0.01, radius - safeBodyRadius);
  const sign = hemisphere === "back" ? -1 : 1;
  const minAbsZ = Math.min(safeBodyRadius, centerLimit);

  const original = {
    x: state.position.x,
    y: state.position.y,
    z: state.position.z
  };

  let zAbs = Math.abs(Number.isFinite(original.z) ? original.z : 0);
  zAbs = Math.max(minAbsZ, Math.min(centerLimit, zAbs));
  let x = Number.isFinite(original.x) ? original.x : 0;
  let y = Number.isFinite(original.y) ? original.y : 0;

  const maxXY = Math.sqrt(Math.max(0, centerLimit * centerLimit - zAbs * zAbs));
  const xy = Math.hypot(x, y);
  if (xy > maxXY && xy > 0.000001) {
    const scale = maxXY / xy;
    x *= scale;
    y *= scale;
  }

  const z = sign * zAbs;
  const velocity = {
    x: Number.isFinite(state.velocity.x) ? state.velocity.x : 0,
    y: Number.isFinite(state.velocity.y) ? state.velocity.y : 0,
    z: Number.isFinite(state.velocity.z) ? state.velocity.z : 0
  };

  const wasWrongHalf = hemisphere === "front" ? original.z < minAbsZ : original.z > -minAbsZ;
  if (wasWrongHalf && velocity.z * sign < 0) {
    velocity.z *= -Math.max(0, Math.min(1, restitution));
  }

  const originalDistance = Math.hypot(original.x, original.y, original.z);
  if (originalDistance > centerLimit + 0.000001) {
    const d = Math.max(originalDistance, 0.000001);
    const nx = original.x / d;
    const ny = original.y / d;
    const nz = original.z / d;
    const outward = velocity.x * nx + velocity.y * ny + velocity.z * nz;
    if (outward > 0) {
      const bounce = 1 + Math.max(0, Math.min(1, restitution));
      velocity.x -= bounce * outward * nx;
      velocity.y -= bounce * outward * ny;
      velocity.z -= bounce * outward * nz;
    }
  }

  return {
    position: { x, y, z },
    velocity
  };
}

export function bodyFitsHemisphereSphere(
  position: Vec3,
  hemisphere: Hemisphere,
  sphereRadius: number,
  bodyRadius = 0,
  epsilon = 1e-6
) {
  const radius = Math.max(0.1, sphereRadius);
  const safeBodyRadius = Math.min(Math.max(0, bodyRadius), maxBodyRadiusForSphere(radius));
  const centerLimit = radius - safeBodyRadius;
  const inSphere = Math.hypot(position.x, position.y, position.z) <= centerLimit + epsilon;
  const inHalf = hemisphere === "front"
    ? position.z >= safeBodyRadius - epsilon
    : position.z <= -safeBodyRadius + epsilon;
  return inSphere && inHalf;
}
