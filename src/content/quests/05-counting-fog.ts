import type { Quest } from "../schema";

export const countingFog: Quest = {
  id: "counting-fog",
  title: "The Counting Fog",
  place: {
    name: "The market square",
    road: "The last road climbs to the market on the hill, where the fog is thickest.",
  },
  scene: {
    id: "counting-fog",
    alt: "The keeper stands in a market square in thick fog, crowded with dim figures. The fog-counter runs up with a tally board. The pumpkin stalls are piled high and untouched.",
  },
  story: [
    "The fog-counter runs up the hill, out of breath. \"Twice as many visitors came through the fog this week!\"",
    "Down in the market, the pumpkin stalls are as full as they were at dawn.",
  ],
  choices: [
    {
      id: "signs",
      label: "Put up more pumpkin signs and keep counting visitors",
      tier: "muddled",
    },
    { id: "pumpkins", label: "Start counting pumpkins sold instead of visitors", tier: "wise" },
    { id: "celebrate", label: "Celebrate, and send word to bring in even more visitors", tier: "poor" },
  ],
  reactions: {
    wise: "The new tally is small and honest. It shows the visitors leave before the market opens, so you open at dusk, and the stalls are empty by nightfall.",
    muddled:
      "The signs are lovely. The visitor count climbs again, and the pumpkins begin to soften on the stalls.",
    poor: "The lanes fill with strangers admiring the fog. The growers quietly load their unsold pumpkins and leave for another village.",
  },
  lore: {
    line: "Watch the metric that means value, not the one that looks good.",
    sourceTitle: "Eric Ries: Vanity Metrics vs. Actionable Metrics",
    sourceUrl: "https://tim.blog/2009/05/19/vanity-metrics-vs-actionable-metrics/",
  },
  rubric: {
    lesson: "Watch the metric that means value, not the one that looks good.",
    tiers: {
      wise: "Stops trusting the visitor count as the sign of success and turns to what shows real value: pumpkins sold, money earned by growers, or visitors who buy. May also investigate why visitors are not buying.",
      muddled:
        "Notices that sales are flat and tries to fix it, but keeps visitors as the number that matters or changes nothing about what is measured: more signs, lower prices, or a guess at the cause with no new count.",
      poor: "Treats the doubled visitor count as success: celebrates, reports it, or tries to raise it further. Also any answer that ignores the question.",
    },
    examples: {
      wise: [
        "Visitors don't feed anyone. How many pumpkins left the square this week?",
        "Follow ten visitors and see why they walk past the stalls, and track sales from now on.",
      ],
      muddled: [
        "Halve the pumpkin prices so the visitors start buying.",
        "Move the stalls closer to the gate where the visitors come in.",
      ],
      poor: [
        "Doubled! Tell the Baron at once, he will be delighted.",
        "Make more fog so even more people come.",
      ],
    },
  },
};
