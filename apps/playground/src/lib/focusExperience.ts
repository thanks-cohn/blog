export type Vec3 = { x: number; y: number; z: number };
export type FocusSide = "left" | "right";

export function chooseFocusSide(currentX: number): FocusSide {
  return currentX < 0 ? "left" : "right";
}

export function solveFocusComposition(args: {
  objectPosition: Vec3;
  objectRadius: number;
  normalCameraDistance: number;
}) {
  const radius = Math.max(0.05, Number(args.objectRadius) || 0.05);
  const side = chooseFocusSide(args.objectPosition.x);

  // Focus mode is intentionally NOT a scene-fit camera. The selected object
  // becomes the eye-level hero and may loom large. Other assets may leave the
  // viewport. The main image remains behind it at station center.
  const loomingGap = Math.max(1.15, Math.min(3.1, radius * 2.15 + 0.55));
  const cameraDistance = args.objectPosition.z + loomingGap;

  return {
    side,
    cameraOffsetX: args.objectPosition.x,
    cameraOffsetY: args.objectPosition.y,
    cameraDistance,
    targetOffsetX: args.objectPosition.x,
    targetOffsetY: args.objectPosition.y,
    targetOffsetZ: args.objectPosition.z,
    textSide: side === "left" ? "right" : "left"
  } as const;
}
