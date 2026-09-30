export type JourneyDirection = "forward" | "backward";
export type JourneyBoundary = "wrap" | "stop" | "reverse";
export type JourneyScope = "station" | "all" | "explicit";
export type JourneyPhase = "idle" | "focus" | "intermission" | "travel";
export type IntermissionStrategy = "random" | "round-robin" | "sequence";

export type JourneyTarget = {
  stationId: string;
  stationIndex: number;
  assetName: string;
  track: string;
};

export type FocusJourneyConfig = {
  enabled: boolean;
  continuous: boolean;
  scope: JourneyScope;
  direction: JourneyDirection;
  boundary: JourneyBoundary;
  intermission: {
    enabled: boolean;
    tracks: string[];
    strategy: IntermissionStrategy;
    sequence: string[];
    avoidImmediateRepeat: boolean;
    between: "stations" | "items";
    playToEnd: boolean;
  };
  explicitRoute: JourneyTarget[];
};

export type JourneyState = {
  phase: JourneyPhase;
  index: number;
  direction: JourneyDirection;
  lastIntermissionTrack?: string;
  intermissionCursor?: number;
};

export type JourneyStep =
  | { type: "stop" }
  | { type: "focus"; target: JourneyTarget; index: number; direction: JourneyDirection }
  | {
      type: "intermission";
      track: string;
      playToEnd: boolean;
      then: { target: JourneyTarget; index: number; direction: JourneyDirection };
    };

export function normalizeFocusJourneyConfig(raw: Partial<FocusJourneyConfig> | null | undefined): FocusJourneyConfig {
  const rawIntermission: any = raw?.intermission ?? {};
  const legacyTrack =
    typeof rawIntermission.track === "string" && rawIntermission.track
      ? [rawIntermission.track]
      : [];

  return {
    enabled: Boolean(raw?.enabled ?? false),
    continuous: Boolean(raw?.continuous ?? false),
    scope:
      raw?.scope === "all" || raw?.scope === "explicit"
        ? raw.scope
        : "station",
    direction: raw?.direction === "backward" ? "backward" : "forward",
    boundary:
      raw?.boundary === "stop" || raw?.boundary === "reverse"
        ? raw.boundary
        : "wrap",
    intermission: {
      enabled: Boolean(rawIntermission.enabled ?? false),
      tracks: Array.isArray(rawIntermission.tracks)
        ? rawIntermission.tracks.map((track: unknown) => String(track)).filter(Boolean)
        : legacyTrack,
      strategy:
        rawIntermission.strategy === "round-robin" || rawIntermission.strategy === "sequence"
          ? rawIntermission.strategy
          : "random",
      sequence: Array.isArray(rawIntermission.sequence)
        ? rawIntermission.sequence.map((track: unknown) => String(track)).filter(Boolean)
        : [],
      avoidImmediateRepeat: rawIntermission.avoidImmediateRepeat !== false,
      between: rawIntermission.between === "items" ? "items" : "stations",
      playToEnd: rawIntermission.playToEnd !== false
    },
    explicitRoute: Array.isArray(raw?.explicitRoute)
      ? raw!.explicitRoute.map((entry) => ({
          stationId: String(entry.stationId),
          stationIndex: Number(entry.stationIndex) || 0,
          assetName: String(entry.assetName),
          track: String(entry.track ?? "")
        }))
      : []
  };
}

export function journeyTargets(
  discovered: JourneyTarget[],
  config: FocusJourneyConfig,
  currentStationId?: string
): JourneyTarget[] {
  if (config.scope === "explicit") return config.explicitRoute.map((entry) => ({ ...entry }));
  if (config.scope === "station" && currentStationId) {
    return discovered.filter((entry) => entry.stationId === currentStationId);
  }
  return discovered.map((entry) => ({ ...entry }));
}

function nextIndex(
  length: number,
  index: number,
  direction: JourneyDirection,
  boundary: JourneyBoundary
) {
  if (length <= 0) return { index: -1, direction, stopped: true };
  const delta = direction === "forward" ? 1 : -1;
  const candidate = index + delta;
  if (candidate >= 0 && candidate < length) {
    return { index: candidate, direction, stopped: false };
  }

  if (boundary === "stop") return { index, direction, stopped: true };
  if (boundary === "wrap") {
    return {
      index: direction === "forward" ? 0 : length - 1,
      direction,
      stopped: false
    };
  }

  const reversed: JourneyDirection = direction === "forward" ? "backward" : "forward";
  const reverseIndex = Math.max(
    0,
    Math.min(length - 1, index + (reversed === "forward" ? 1 : -1))
  );
  return { index: reverseIndex, direction: reversed, stopped: false };
}

export function chooseIntermissionTrack(
  config: FocusJourneyConfig,
  state: JourneyState,
  randomValue = Math.random()
): string {
  const pool = config.intermission.tracks.filter(Boolean);
  const sequence = config.intermission.sequence.filter(Boolean);
  const tracks =
    config.intermission.strategy === "sequence" && sequence.length
      ? sequence
      : pool;
  if (!config.intermission.enabled || tracks.length === 0) return "";

  let candidates = tracks;
  if (
    config.intermission.avoidImmediateRepeat &&
    state.lastIntermissionTrack &&
    tracks.length > 1
  ) {
    candidates = tracks.filter((track) => track !== state.lastIntermissionTrack);
  }

  if (
    config.intermission.strategy === "round-robin" ||
    config.intermission.strategy === "sequence"
  ) {
    const cursor = Math.max(0, Number(state.intermissionCursor) || 0);
    return candidates[cursor % candidates.length] ?? "";
  }

  const clamped = Math.max(0, Math.min(0.999999, Number(randomValue) || 0));
  return candidates[Math.floor(clamped * candidates.length)] ?? candidates[0] ?? "";
}

function stepToTarget(
  targets: JourneyTarget[],
  state: JourneyState,
  config: FocusJourneyConfig,
  targetIndex: number,
  direction: JourneyDirection,
  randomValue?: number
): JourneyStep {
  const current = targets[state.index] ?? null;
  const target = targets[targetIndex];
  if (!target) return { type: "stop" };

  const stationChanged = Boolean(current && current.stationId !== target.stationId);
  const needsIntermission =
    config.intermission.enabled &&
    (config.intermission.between === "items" || stationChanged);

  if (needsIntermission) {
    const track = chooseIntermissionTrack(config, state, randomValue);
    if (track) {
      return {
        type: "intermission",
        track,
        playToEnd: config.intermission.playToEnd,
        then: { target, index: targetIndex, direction }
      };
    }
  }

  return { type: "focus", target, index: targetIndex, direction };
}

export function nextJourneyStep(
  targets: JourneyTarget[],
  state: JourneyState,
  config: FocusJourneyConfig,
  randomValue?: number
): JourneyStep {
  const next = nextIndex(targets.length, state.index, state.direction, config.boundary);
  if (next.stopped || next.index < 0) return { type: "stop" };
  return stepToTarget(targets, state, config, next.index, next.direction, randomValue);
}

export function previousJourneyStep(
  targets: JourneyTarget[],
  state: JourneyState,
  config: FocusJourneyConfig,
  randomValue?: number
): JourneyStep {
  const direction: JourneyDirection =
    state.direction === "forward" ? "backward" : "forward";
  const previous = nextIndex(targets.length, state.index, direction, config.boundary);
  if (previous.stopped || previous.index < 0) return { type: "stop" };
  return stepToTarget(targets, state, config, previous.index, direction, randomValue);
}

export function restartJourneyStep(
  targets: JourneyTarget[],
  state: JourneyState,
  config: FocusJourneyConfig,
  randomValue?: number
): JourneyStep {
  if (!targets.length) return { type: "stop" };
  return stepToTarget(targets, state, config, 0, "forward", randomValue);
}
