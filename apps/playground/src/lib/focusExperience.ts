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


export function solveFocusComposition(args: {
  side: FocusSide;
  objectRadius: number;
  aspect: number;
  normalCameraDistance: number;
}) {
  const radius = Math.max(0.05, Number(args.objectRadius) || 0.05);
  const sign = args.side === "left" ? -1 : 1;

  // Hero composition: the focused object owns the shot, sitting near center
  // with only a modest lateral bias. The opposite side is reserved for text.
  const heroOffsetX = sign * Math.min(1.45, Math.max(0.72, radius * 0.9));
  const anchor = {
    x: heroOffsetX,
    y: 0.05,
    z: Math.max(0.55, radius * 0.62)
  };

  // Move closer than the normal station camera so the selected object is
  // foreground-dominant, but retain enough distance to keep most of the
  // 5.4 x 5.9 main picture visible behind it.
  const baseDistance = focusCameraDistance({
    objectRadius: radius,
    objectX: anchor.x,
    imageHalfWidth: 2.7,
    imageHalfHeight: 2.95,
    verticalFovDegrees: 50,
    aspect: args.aspect,
    padding: 0.3
  });

  const distance = Math.max(
    4.4,
    Math.min(args.normalCameraDistance * 0.78, baseDistance * 0.9)
  );

  return {
    anchor,
    // Slight lens offset produces depth/parallax without pushing the subject
    // out of the visual center.
    cameraOffsetX: sign * Math.min(0.65, Math.max(0.2, radius * 0.28)),
    // Aim mostly at the object, not the image center.
    targetOffsetX: sign * Math.min(1.15, Math.max(0.55, Math.abs(anchor.x) * 0.82)),
    cameraDistance: distance,
    // Explicit semantic slot for the future Star-Wars-style text plane.
    textSide: args.side === "left" ? "right" : "left"
  } as const;
}) {
  const anchor = focusObjectAnchor(args.side, args.objectRadius);
  const distance = Math.max(
    5.2,
    Math.min(
      args.normalCameraDistance * 0.9,
      focusCameraDistance({
        objectRadius: args.objectRadius,
        objectX: anchor.x,
        imageHalfWidth: 2.7,
        imageHalfHeight: 2.95,
        verticalFovDegrees: 50,
        aspect: args.aspect,
        padding: 0.6
      })
    )
  );
  const sign = args.side === "left" ? -1 : 1;

  // Shift the lens slightly toward the featured object and aim between it
  // and the image. This creates foreground subject + readable background art.
  return {
    anchor,
    cameraOffsetX: sign * Math.min(1.15, Math.max(0.35, Math.abs(anchor.x) * 0.22)),
    targetOffsetX: sign * Math.min(1.5, Math.max(0.45, Math.abs(anchor.x) * 0.34)),
    cameraDistance: distance
  };
}
