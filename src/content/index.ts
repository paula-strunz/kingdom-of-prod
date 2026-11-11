import type { EndingId } from "../engine/types";
import type { Ending, Quest } from "./schema";
import { lanternPleas } from "./quests/01-lantern-pleas";
import { whisperingWell } from "./quests/02-whispering-well";
import { clockmakersNight } from "./quests/03-clockmakers-night";
import { baronsRaven } from "./quests/04-barons-raven";
import { countingFog } from "./quests/05-counting-fog";

/** The V0 quests, in play order. */
export const quests: readonly Quest[] = [
  lanternPleas,
  whisperingWell,
  clockmakersNight,
  baronsRaven,
  countingFog,
];

export const endings: Record<EndingId, Ending> = {
  thrives: {
    title: "Hollowmere thrives",
    lines: [
      "The fog still comes each evening, but it finds every lane lit.",
      "The village keeps its keeper.",
    ],
  },
  muddles: {
    title: "Hollowmere muddles on",
    lines: [
      "Some lanterns burn and some do not.",
      "The village gets through the winter, and wonders what the next harvest will bring.",
    ],
  },
  fog: {
    title: "The fog takes Hollowmere",
    lines: [
      "One by one, the lanterns go dark.",
      "By morning the fog has settled over the rooftops, soft and quiet, and no road leads here any more.",
    ],
  },
};
