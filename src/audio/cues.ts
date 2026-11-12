import type { EndingId, Phase, Tier } from "../engine/types";

/** Every sound effect the game can play. Each one is generated in `sound.ts`. */
export const CUES = [
  "footsteps",
  "select",
  "lanternLit",
  "lanternDim",
  "lanternDark",
  "raven",
  "drip",
  "hammer",
  "bell",
  "clockBreaks",
  "coins",
  "splash",
  "endingThrives",
  "endingMuddles",
  "endingFog",
] as const;
export type Cue = (typeof CUES)[number];

/** The places that have their own ambience. The ids are the quest scene ids. */
export const PLACES = [
  "lantern-pleas",
  "whispering-well",
  "clockmakers-night",
  "barons-raven",
  "counting-fog",
] as const;
export type PlaceId = (typeof PLACES)[number];

const LANTERN_CUE: Record<Tier, Cue> = {
  wise: "lanternLit",
  muddled: "lanternDim",
  poor: "lanternDark",
};

const ENDING_CUE: Record<EndingId, Cue> = {
  thrives: "endingThrives",
  muddles: "endingMuddles",
  fog: "endingFog",
};

/** What is heard when the player arrives at a place. A named creature or object is heard here. */
const ARRIVAL_CUES: Record<PlaceId, Cue[]> = {
  "lantern-pleas": [],
  "whispering-well": ["drip"],
  "clockmakers-night": ["hammer"],
  "barons-raven": ["raven"],
  "counting-fog": ["bell"],
};

/** What is heard, after the lantern, when an outcome is shown. */
const OUTCOME_CUES: Partial<Record<PlaceId, Partial<Record<Tier, Cue>>>> = {
  "clockmakers-night": { poor: "clockBreaks" },
  "barons-raven": { wise: "raven", poor: "splash" },
  "counting-fog": { wise: "coins" },
};

export type Beat = {
  phase: Phase;
  /** Scene id of the current quest. */
  place?: string;
  /** Tier of the current quest, once it is decided. */
  tier?: Tier;
  /** The ending reached, in the ending phase. */
  ending?: EndingId;
};

const isPlace = (id: string | undefined): id is PlaceId =>
  PLACES.includes(id as PlaceId);

/** The effects to play when a beat begins, in order. */
export function cuesFor({ phase, place, tier, ending }: Beat): Cue[] {
  switch (phase) {
    case "travel":
      return ["footsteps"];
    case "scene":
      return isPlace(place) ? ARRIVAL_CUES[place] : [];
    case "reaction": {
      if (!tier) return [];
      const extra = isPlace(place) ? OUTCOME_CUES[place]?.[tier] : undefined;
      return extra ? [LANTERN_CUE[tier], extra] : [LANTERN_CUE[tier]];
    }
    case "ending":
      return ending ? [ENDING_CUE[ending]] : [];
    default:
      return [];
  }
}

/** The place whose ambience plays in this beat. It stops when the outcome is shown. */
export function placeFor({ phase, place }: Beat): PlaceId | null {
  const audible = phase === "scene" || phase === "decision" || phase === "judging";
  return audible && isPlace(place) ? place : null;
}
