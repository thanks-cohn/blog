export type Vec3 = { x: number; y: number; z: number };

export type FreeObjectMotion = {
  type: "free";
};

export type FixedBehavior =
  | { type: "none" }
  | { type: "bob"; amplitude?: number; speed?: number }
  | { type: "sway"; amplitude?: number; speed?: number }
  | { type: "orbit"; amplitude?: number; speed?: number };

export type FixedObjectMotion = {
  type: "fixed";
  fixedMode: "anchored" | "range";
  range?: number;
  behavior?: FixedBehavior;
};

export type ObjectMotion = FreeObjectMotion | FixedObjectMotion;

export const DEFAULT_FREE_MOTION: FreeObjectMotion = { type: "free" };

export function normalizeObjectMotion(value: unknown): ObjectMotion {
  const raw = value as any;
  if (raw?.type !== "fixed") return { type: "free" };

  const fixedMode = raw.fixedMode === "range" ? "range" : "anchored";
  if (fixedMode === "anchored") {
    return { type: "fixed", fixedMode: "anchored", behavior: { type: "none" } };
  }

  const range = Math.max(0, Number.isFinite(Number(raw.range)) ? Number(raw.range) : 0.8);
  const behaviorType =
    raw?.behavior?.type === "sway" || raw?.behavior?.type === "orbit" || raw?.behavior?.type === "none"
      ? raw.behavior.type
      : "bob";

  return {
    type: "fixed",
    fixedMode: "range",
    range,
    behavior: {
      type: behaviorType,
      amplitude: Math.max(
        0,
        Number.isFinite(Number(raw?.behavior?.amplitude))
          ? Math.min(Number(raw.behavior.amplitude), range)
          : Math.min(range, 0.35)
      ),
      speed: Math.max(
        0,
        Number.isFinite(Number(raw?.behavior?.speed))
          ? Number(raw.behavior.speed)
          : 0.7
      )
    } as FixedBehavior
  };
}

export function clampOffsetToRange(offset: Vec3, range: number): Vec3 {
  const safeRange = Math.max(0, Number.isFinite(range) ? range : 0);
  const distance = Math.hypot(offset.x, offset.y, offset.z);
  if (distance <= safeRange || distance <= 0.000001) return { ...offset };
  const scale = safeRange / distance;
  return {
    x: offset.x * scale,
    y: offset.y * scale,
    z: offset.z * scale
  };
}

export function fixedPositionAtTime(
  anchor: Vec3,
  motion: FixedObjectMotion,
  phase: number,
  timeSeconds: number
): Vec3 {
  if (motion.fixedMode === "anchored") return { ...anchor };

  const normalized = normalizeObjectMotion(motion) as FixedObjectMotion;
  const range = Math.max(0, normalized.range ?? 0);
  const behavior = normalized.behavior ?? { type: "bob" };
  const amplitude = Math.min(
    range,
    Math.max(0, "amplitude" in behavior ? Number(behavior.amplitude ?? 0) : 0)
  );
  const speed = Math.max(
    0,
    "speed" in behavior ? Number(behavior.speed ?? 0) : 0
  );
  const t = timeSeconds * speed + phase;

  let offset: Vec3 = { x: 0, y: 0, z: 0 };
  if (behavior.type === "bob") {
    offset.y = Math.sin(t) * amplitude;
  } else if (behavior.type === "sway") {
    offset.x = Math.sin(t) * amplitude;
  } else if (behavior.type === "orbit") {
    offset.x = Math.cos(t) * amplitude;
    offset.y = Math.sin(t) * amplitude;
  }

  const clamped = clampOffsetToRange(offset, range);
  return {
    x: anchor.x + clamped.x,
    y: anchor.y + clamped.y,
    z: anchor.z + clamped.z
  };
}
