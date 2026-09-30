export type JourneyDirection = "forward" | "backward";
export type JourneyBoundary = "wrap" | "stop" | "reverse";
export type JourneyScope = "station" | "all" | "explicit";
export type JourneyPhase = "idle" | "focus" | "intermission" | "travel";

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
    track: string;
    between: "stations" | "items";
    playToEnd: boolean;
  };
  explicitRoute: JourneyTarget[];
};

export type JourneyState = {
  phase: JourneyPhase;
  index: number;
  direction: JourneyDirection;
};

export type JourneyStep =
  | { type: "stop" }
  | { type: "focus"; target: JourneyTarget; index: number; direction: JourneyDirection }
  | {
      type: "intermission";
      track: string;
      then: { target: JourneyTarget; index: number; direction: JourneyDirection };
    };

export function normalizeFocusJourneyConfig(raw: Partial<FocusJourneyConfig> | null | undefined): FocusJourneyConfig {
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
      enabled: Boolean(raw?.intermission?.enabled ?? false),
      track: String(raw?.intermission?.track ?? ""),
      between: raw?.intermission?.between === "items" ? "items" : "stations",
      playToEnd: raw?.intermission?.playToEnd !== false
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
  const reverseIndex = Math.max(0, Math.min(length - 1, index + (reversed === "forward" ? 1 : -1)));
  return { index: reverseIndex, direction: reversed, stopped: false };
}

export function nextJourneyStep(
  targets: JourneyTarget[],
  state: JourneyState,
  config: FocusJourneyConfig
): JourneyStep {
  const next = nextIndex(targets.length, state.index, state.direction, config.boundary);
  if (next.stopped || next.index < 0) return { type: "stop" };

  const current = targets[state.index] ?? null;
  const target = targets[next.index];
  if (!target) return { type: "stop" };

  const stationChanged = Boolean(current && current.stationId !== target.stationId);
  const useIntermission =
    config.intermission.enabled &&
    Boolean(config.intermission.track) &&
    (config.intermission.between === "items" || stationChanged);

  if (useIntermission) {
    return {
      type: "intermission",
      track: config.intermission.track,
      then: { target, index: next.index, direction: next.direction }
    };
  }

  return { type: "focus", target, index: next.index, direction: next.direction };
}

export function previousJourneyStep(
  targets: JourneyTarget[],
  state: JourneyState,
  config: FocusJourneyConfig
): JourneyStep {
  return nextJourneyStep(
    targets,
    {
      ...state,
      direction: state.direction === "forward" ? "backward" : "forward"
    },
    config
  );
}
