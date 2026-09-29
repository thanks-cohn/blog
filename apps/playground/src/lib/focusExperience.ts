export type Vec3 = { x: number; y: number; z: number };
export type FocusSide = "left" | "right";

export function chooseFocusSide(currentX: number): FocusSide {
  return currentX < 0 ? "left" : "right";
}

export function focusCameraDistance(args: {
  objectRadius: number;
  objectPosition: Vec3;
  imageHalfWidth?: number;
  imageHalfHeight?: number;
  verticalFovDegrees?: number;
  aspect?: number;
  padding?: number;
}) {
  const radius = Math.max(0.05, Number(args.objectRadius) || 0.05);
  const imageHalfWidth = Math.max(0.1, Number(args.imageHalfWidth ?? 2.7));
  const imageHalfHeight = Math.max(0.1, Number(args.imageHalfHeight ?? 2.95));
  const verticalFov = Math.max(10, Math.min(120, Number(args.verticalFovDegrees ?? 50))) * Math.PI / 180;
  const aspect = Math.max(0.35, Number(args.aspect ?? 1));
  const padding = Math.max(0, Number(args.padding ?? 0.45));
  const tanV = Math.tan(verticalFov * 0.5);
  const tanH = tanV * aspect;

  const minX = Math.min(-imageHalfWidth, args.objectPosition.x - radius);
  const maxX = Math.max(imageHalfWidth, args.objectPosition.x + radius);
  const minY = Math.min(-imageHalfHeight, args.objectPosition.y - radius);
  const maxY = Math.max(imageHalfHeight, args.objectPosition.y + radius);
  const halfWidth = (maxX - minX) * 0.5 + padding;
  const halfHeight = (maxY - minY) * 0.5 + padding;

  // If the object sits in front of the image, the camera also needs enough
  // depth to fit the object's full envelope without moving the object itself.
  const objectDepthNeed =
    Math.max(0, args.objectPosition.z) +
    radius / Math.max(0.01, Math.min(tanV, tanH));

  return Math.max(
    halfHeight / Math.max(0.01, tanV),
    halfWidth / Math.max(0.01, tanH),
    objectDepthNeed
  );
}

export function solveFocusComposition(args: {
  objectPosition: Vec3;
  objectRadius: number;
  aspect: number;
  normalCameraDistance: number;
}) {
  const radius = Math.max(0.05, Number(args.objectRadius) || 0.05);
  const side = chooseFocusSide(args.objectPosition.x);
  const sign = side === "left" ? -1 : 1;

  const fitDistance = focusCameraDistance({
    objectRadius: radius,
    objectPosition: args.objectPosition,
    imageHalfWidth: 2.7,
    imageHalfHeight: 2.95,
    verticalFovDegrees: 50,
    aspect: args.aspect,
    padding: 0.34
  });

  // Move the CAMERA toward the selected object's side. The object remains at
  // its authored/current world position. Partial tracking keeps it near the
  // visual center while leaving the opposite side open for text.
  const cameraOffsetX = Math.max(-2.2, Math.min(2.2, args.objectPosition.x * 0.58));
  const cameraOffsetY = Math.max(-0.8, Math.min(0.8, args.objectPosition.y * 0.28 + 0.12));
  const targetOffsetX = Math.max(-2.4, Math.min(2.4, args.objectPosition.x * 0.82));
  const targetOffsetY = Math.max(-1.25, Math.min(1.25, args.objectPosition.y * 0.5));

  // The shot should feel like an approach, so prefer a closer camera than the
  // normal station view, but never violate the mathematical fit requirement.
  const cameraDistance = Math.max(
    4.2,
    Math.min(args.normalCameraDistance * 0.82, Math.max(fitDistance, 4.2))
  );

  return {
    side,
    cameraOffsetX,
    cameraOffsetY,
    targetOffsetX,
    targetOffsetY,
    cameraDistance,
    textSide: side === "left" ? "right" : "left"
  } as const;
}
