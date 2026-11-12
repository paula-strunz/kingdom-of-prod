import { describe, expect, it } from "vitest";
import { CUES, PLACES, cuesFor, placeFor } from "../../src/audio/cues";
import { quests } from "../../src/content";
import { TIERS } from "../../src/engine/types";

describe("sound cues", () => {
  it("knows a place for every quest scene", () => {
    expect(quests.map((q) => q.scene.id)).toEqual([...PLACES]);
  });

  it("plays footsteps on the way to each place", () => {
    expect(cuesFor({ phase: "travel", place: "barons-raven" })).toEqual(["footsteps"]);
  });

  it("lets the raven be heard when the player arrives at the Baron's Raven", () => {
    expect(cuesFor({ phase: "scene", place: "barons-raven" })).toContain("raven");
  });

  it("does not play the raven anywhere else on arrival", () => {
    for (const place of PLACES.filter((p) => p !== "barons-raven")) {
      expect(cuesFor({ phase: "scene", place })).not.toContain("raven");
    }
  });

  it("plays a different lantern sound for each tier, first, in every quest", () => {
    for (const place of PLACES) {
      const first = TIERS.map((tier) => cuesFor({ phase: "reaction", place, tier })[0]);
      expect(first).toEqual(["lanternLit", "lanternDim", "lanternDark"]);
    }
  });

  it("lets the clock be heard when it breaks", () => {
    expect(cuesFor({ phase: "reaction", place: "clockmakers-night", tier: "poor" })).toContain(
      "clockBreaks",
    );
  });

  it("plays a tune for each ending", () => {
    expect(cuesFor({ phase: "ending", ending: "thrives" })).toEqual(["endingThrives"]);
    expect(cuesFor({ phase: "ending", ending: "muddles" })).toEqual(["endingMuddles"]);
    expect(cuesFor({ phase: "ending", ending: "fog" })).toEqual(["endingFog"]);
  });

  it("is silent on the beats with nothing to mark", () => {
    for (const phase of ["title", "decision", "judging", "lore"] as const) {
      expect(cuesFor({ phase, place: "barons-raven", tier: "wise" })).toEqual([]);
    }
    expect(cuesFor({ phase: "reaction", place: "barons-raven" })).toEqual([]);
  });

  it("only returns known cues", () => {
    for (const place of PLACES) {
      for (const tier of TIERS) {
        for (const cue of cuesFor({ phase: "reaction", place, tier })) expect(CUES).toContain(cue);
      }
    }
  });
});

describe("place ambience", () => {
  it("plays from arrival until the outcome", () => {
    const place = "whispering-well";
    expect(placeFor({ phase: "travel", place })).toBeNull();
    expect(placeFor({ phase: "scene", place })).toBe(place);
    expect(placeFor({ phase: "decision", place })).toBe(place);
    expect(placeFor({ phase: "judging", place })).toBe(place);
    expect(placeFor({ phase: "reaction", place })).toBeNull();
    expect(placeFor({ phase: "lore", place })).toBeNull();
    expect(placeFor({ phase: "ending" })).toBeNull();
  });
});
