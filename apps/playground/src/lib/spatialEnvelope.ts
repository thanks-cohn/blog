export type Vec3 = { x: number; y: number; z: number };

export type EnvelopeResponse = "dynamic" | "immovable" | "sensor";

export type SpatialEnvelopeConfig = {
  mode: "bounds" | "manual";
  radius: number | null;
  scale: number;
  padding: number;
  collision: {
    enabled: boolean;
    restitution: number;
    mass: number;
    response: EnvelopeResponse;
  };
  debug: {
    visible: boolean;
    opacity: number;
  };
};

export type SpatialEnvelope = {
  center: Vec3;
  radius: number;
};

export type CollisionBody = {
  position: Vec3;
  velocity: Vec3;
  radius: number;
  mass: number;
  response: EnvelopeResponse;
};

function finite(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeSpatialEnvelopeConfig(
  raw: any,
  defaultResponse: EnvelopeResponse = "dynamic"
): SpatialEnvelopeConfig {
  const response: EnvelopeResponse =
    raw?.collision?.response === "immovable" || raw?.collision?.response === "sensor"
      ? raw.collision.response
      : raw?.collision?.response === "dynamic"
        ? "dynamic"
        : defaultResponse;

  return {
    mode: raw?.mode === "manual" ? "manual" : "bounds",
    radius:
      raw?.mode === "manual" && Number.isFinite(Number(raw?.radius))
        ? Math.max(0.01, Number(raw.radius))
        : null,
    scale: Math.max(0.05, finite(raw?.scale, 1)),
    padding: Math.max(0, finite(raw?.padding, 0.05)),
    collision: {
      enabled: raw?.collision?.enabled !== false,
      restitution: Math.max(0, Math.min(1, finite(raw?.collision?.restitution, 0.62))),
      mass: Math.max(0.001, finite(raw?.collision?.mass, 1)),
      response
    },
    debug: {
      visible: Boolean(raw?.debug?.visible),
      opacity: Math.max(0.02, Math.min(1, finite(raw?.debug?.opacity, 0.16)))
    }
  };
}

export function spatialEnvelopeRadius(
  boundsRadius: number,
  config: SpatialEnvelopeConfig
) {
  const base =
    config.mode === "manual" && config.radius != null
      ? config.radius
      : Math.max(0.01, finite(boundsRadius, 0.01));
  return Math.max(0.01, base * config.scale + config.padding);
}

export function envelopesOverlap(a: SpatialEnvelope, b: SpatialEnvelope) {
  const distance = Math.hypot(
    b.center.x - a.center.x,
    b.center.y - a.center.y,
    b.center.z - a.center.z
  );
  return distance < a.radius + b.radius;
}

export function resolveSphereCollision(
  a: CollisionBody,
  b: CollisionBody,
  restitution = 0.62
): { a: CollisionBody; b: CollisionBody; collided: boolean } {
  if (a.response === "sensor" || b.response === "sensor") {
    return { a, b, collided: false };
  }

  let dx = b.position.x - a.position.x;
  let dy = b.position.y - a.position.y;
  let dz = b.position.z - a.position.z;
  let distance = Math.hypot(dx, dy, dz);
  const minimum = Math.max(0.0001, a.radius + b.radius);
  if (distance >= minimum) return { a, b, collided: false };

  if (distance < 1e-6) {
    dx = 1;
    dy = 0;
    dz = 0;
    distance = 1;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const nz = dz / distance;
  const penetration = minimum - distance;

  const invMassA = a.response === "immovable" ? 0 : 1 / Math.max(0.001, a.mass);
  const invMassB = b.response === "immovable" ? 0 : 1 / Math.max(0.001, b.mass);
  const invMassTotal = invMassA + invMassB;

  const nextA: CollisionBody = {
    ...a,
    position: { ...a.position },
    velocity: { ...a.velocity }
  };
  const nextB: CollisionBody = {
    ...b,
    position: { ...b.position },
    velocity: { ...b.velocity }
  };

  if (invMassTotal > 0) {
    const moveA = penetration * (invMassA / invMassTotal);
    const moveB = penetration * (invMassB / invMassTotal);
    nextA.position.x -= nx * moveA;
    nextA.position.y -= ny * moveA;
    nextA.position.z -= nz * moveA;
    nextB.position.x += nx * moveB;
    nextB.position.y += ny * moveB;
    nextB.position.z += nz * moveB;
  }

  const rvx = nextB.velocity.x - nextA.velocity.x;
  const rvy = nextB.velocity.y - nextA.velocity.y;
  const rvz = nextB.velocity.z - nextA.velocity.z;
  const separatingVelocity = rvx * nx + rvy * ny + rvz * nz;

  if (separatingVelocity < 0 && invMassTotal > 0) {
    const e = Math.max(0, Math.min(1, restitution));
    const impulse = -(1 + e) * separatingVelocity / invMassTotal;
    const ix = impulse * nx;
    const iy = impulse * ny;
    const iz = impulse * nz;

    nextA.velocity.x -= ix * invMassA;
    nextA.velocity.y -= iy * invMassA;
    nextA.velocity.z -= iz * invMassA;
    nextB.velocity.x += ix * invMassB;
    nextB.velocity.y += iy * invMassB;
    nextB.velocity.z += iz * invMassB;
  }

  return { a: nextA, b: nextB, collided: true };
}
