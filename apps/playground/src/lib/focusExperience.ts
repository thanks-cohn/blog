export type Vec3 = { x: number; y: number; z: number };
export type FocusSide = "left" | "right";

export function chooseFocusSide(currentX: number): FocusSide {
  return currentX < 0 ? "left" : "right";
}

export function focusObjectAnchor(
  side: FocusSide,
  objectRadius: number,
  imageHalfWidth = 2.7,
  gap = 0.45
): Vec3 {
  const radius = Math.max(0.05, Number(objectRadius) || 0.05);
  const sign = side === "left" ? -1 : 1;
  return {
    x: sign * (imageHalfWidth + radius * 0.72 + gap),
    y: 0,
    z: Math.max(radius * 0.55, 0.45)
  };
}

export function focusCameraDistance(args: {
  objectRadius: number;
  objectX: number;
  imageHalfWidth?: number;
  imageHalfHeight?: number;
  verticalFovDegrees?: number;
  aspect?: number;
  padding?: number;
}) {
  const objectRadius = Math.max(0.05, Number(args.objectRadius) || 0.05);
  const imageHalfWidth = Math.max(0.1, Number(args.imageHalfWidth ?? 2.7));
  const imageHalfHeight = Math.max(0.1, Number(args.imageHalfHeight ?? 2.95));
  const verticalFov = Math.max(10, Math.min(120, Number(args.verticalFovDegrees ?? 50))) * Math.PI / 180;
  const aspect = Math.max(0.35, Number(args.aspect ?? 1));
  const padding = Math.max(0, Number(args.padding ?? 0.45));

  const halfWidth = Math.max(imageHalfWidth, Math.abs(args.objectX) + objectRadius) + padding;
  const halfHeight = Math.max(imageHalfHeight, objectRadius) + padding;
  const tanV = Math.tan(verticalFov * 0.5);
  const tanH = tanV * aspect;

  return Math.max(
    halfHeight / Math.max(0.01, tanV),
    halfWidth / Math.max(0.01, tanH)
  );
}
