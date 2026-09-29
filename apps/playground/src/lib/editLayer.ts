export type Hemisphere = "front" | "back";

export type EditMode = "none" | "hemisphere";

export type HemisphereCameraPreset =
  | "top"
  | "side"
  | "bottom-corner-up"
  | "top-left-down";

export type Vec3 = { x: number; y: number; z: number };

export type HemisphereEditorState = {
  mode: "hemisphere";
  hemisphere: Hemisphere;
  cameraPreset: HemisphereCameraPreset;
  zoom: number;
  repositionObjectName: string;
};

export type EditLayerState =
  | { mode: "none" }
  | HemisphereEditorState;

export const HEMISPHERE_CAMERA_PRESETS: Array<{
  id: HemisphereCameraPreset;
  label: string;
}> = [
  { id: "top", label: "Top" },
  { id: "side", label: "Side" },
  { id: "bottom-corner-up", label: "Bottom corner · looking up" },
  { id: "top-left-down", label: "Top-left · looking down" }
];

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

export function hemispherePresetDirection(
  preset: HemisphereCameraPreset,
  hemisphere: Hemisphere
): Vec3 {
  const z = hemisphere === "back" ? -1 : 1;

  if (preset === "side") {
    // Intentionally oblique rather than a mathematically pure side view:
    // keep most of the active hemisphere readable while retaining the image
    // as a visible spatial reference in the viewport.
    return normalize({ x: 1, y: 0.05, z: 0.52 * z });
  }
  if (preset === "bottom-corner-up") {
    return normalize({ x: 0.62, y: -0.62, z: 0.58 * z });
  }
  if (preset === "top-left-down") {
    return normalize({ x: -0.62, y: 0.62, z: 0.58 * z });
  }
  return normalize({ x: 0.05, y: 1, z: 0.12 * z });
}

export function clampHemisphereEditorZoom(value: number) {
  const zoom = Number.isFinite(Number(value)) ? Number(value) : 1;
  return Math.max(0.8, Math.min(1.25, zoom));
}

export function hemisphereEditorDistance(
  sphereRadius: number,
  requested?: number
) {
  const radius = Math.max(0.1, sphereRadius);
  const min = radius * 1.45;
  const max = radius * 2.25;
  const fallback = radius * 1.8;
  const value = Number.isFinite(Number(requested)) ? Number(requested) : fallback;
  return Math.max(min, Math.min(max, value));
}

export function hemisphereEditorCameraPosition(
  center: Vec3,
  sphereRadius: number,
  preset: HemisphereCameraPreset,
  hemisphere: Hemisphere,
  requestedDistance?: number
): Vec3 {
  const direction = hemispherePresetDirection(preset, hemisphere);
  const distance = hemisphereEditorDistance(sphereRadius, requestedDistance);

  return {
    x: center.x + direction.x * distance,
    y: center.y + direction.y * distance,
    z: center.z + direction.z * distance
  };
}

export function lookAnglesAt(target: Vec3, camera: Vec3) {
  const forward = normalize({
    x: target.x - camera.x,
    y: target.y - camera.y,
    z: target.z - camera.z
  });

  return {
    // cameraSpace() looks down local -Z. This sign convention keeps the
    // requested target in front of the camera even at strong side angles.
    yaw: Math.atan2(forward.x, -forward.z),
    pitch: Math.asin(Math.max(-1, Math.min(1, forward.y)))
  };
}

export function screenBasis(target: Vec3, camera: Vec3) {
  const forward = normalize({
    x: target.x - camera.x,
    y: target.y - camera.y,
    z: target.z - camera.z
  });

  let upRef: Vec3 = { x: 0, y: 1, z: 0 };
  if (Math.abs(forward.y) > 0.94) upRef = { x: 0, y: 0, z: -1 };

  const right = normalize({
    x: forward.y * upRef.z - forward.z * upRef.y,
    y: forward.z * upRef.x - forward.x * upRef.z,
    z: forward.x * upRef.y - forward.y * upRef.x
  });

  const up = normalize({
    x: right.y * forward.z - right.z * forward.y,
    y: right.z * forward.x - right.x * forward.z,
    z: right.x * forward.y - right.y * forward.x
  });

  return { right, up, forward };
}
