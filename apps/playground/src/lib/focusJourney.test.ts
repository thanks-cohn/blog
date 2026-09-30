import { describe, expect, it } from "vitest";
import {
  journeyTargets,
  nextJourneyStep,
  normalizeFocusJourneyConfig,
  previousJourneyStep,
  type JourneyTarget
} from "./focusJourney";

const targets: JourneyTarget[] = [
  { stationId: "a", stationIndex: 0, assetName: "a-1.glb", track: "a1.mp3" },
  { stationId: "a", stationIndex: 0, assetName: "a-2.glb", track: "a2.mp3" },
  { stationId: "b", stationIndex: 1, assetName: "b-1.glb", track: "b1.mp3" }
];

describe("focusJourney", () => {
  it("filters to the current station or keeps the whole world", () => {
    const station = normalizeFocusJourneyConfig({ scope: "station" });
    expect(journeyTargets(targets, station, "a")).toHaveLength(2);

    const all = normalizeFocusJourneyConfig({ scope: "all" });
    expect(journeyTargets(targets, all, "a")).toHaveLength(3);
  });

  it("inserts an intermission when crossing station boundaries", () => {
    const config = normalizeFocusJourneyConfig({
      scope: "all",
      boundary: "wrap",
      intermission: { enabled: true, track: "intermission.mp3", between: "stations", playToEnd: true }
    });
    const step = nextJourneyStep(
      targets,
      { phase: "focus", index: 1, direction: "forward" },
      config
    );
    expect(step.type).toBe("intermission");
    if (step.type === "intermission") {
      expect(step.track).toBe("intermission.mp3");
      expect(step.then.target.assetName).toBe("b-1.glb");
    }
  });

  it("wraps forever when configured to wrap", () => {
    const config = normalizeFocusJourneyConfig({ scope: "all", boundary: "wrap" });
    const step = nextJourneyStep(
      targets,
      { phase: "focus", index: 2, direction: "forward" },
      config
    );
    expect(step.type).toBe("focus");
    if (step.type === "focus") expect(step.target.assetName).toBe("a-1.glb");
  });

  it("supports semantic previous without faking an arrow key", () => {
    const config = normalizeFocusJourneyConfig({ scope: "all", boundary: "wrap" });
    const step = previousJourneyStep(
      targets,
      { phase: "focus", index: 1, direction: "forward" },
      config
    );
    expect(step.type).toBe("focus");
    if (step.type === "focus") expect(step.target.assetName).toBe("a-1.glb");
  });
});
