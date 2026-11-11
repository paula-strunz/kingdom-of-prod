import type { Quest } from "../schema";

export const lanternPleas: Quest = {
  id: "lantern-pleas",
  title: "The Lantern Pleas",
  scene: {
    id: "lantern-pleas",
    alt: "A crowd of villagers at the gate at dusk, reaching toward two unlit lanterns. Dark lanes stretch away behind them.",
  },
  story: [
    "It is your first night as keeper. The lamplighter hands you two lanterns, the last the village has.",
    "At the gate a crowd is already shouting. Everyone wants one on their own street.",
    "Behind them, the lanes run dark and quiet.",
  ],
  choices: [
    { id: "loudest", label: "Give them to the two who shout loudest", tier: "poor" },
    {
      id: "count",
      label: "Count who walks each lane at night, then light the two busiest dark ones",
      tier: "wise",
    },
    { id: "split", label: "One for the loudest street, one for the darkest", tier: "muddled" },
  ],
  reactions: {
    wise: "You sit up counting footsteps. The lanterns go to Mill Lane and the well path, where half the village walks after dusk. Nobody shouts the next morning.",
    muddled:
      "The darkest lane is safer tonight. The loudest street glows too, though only three people live on it.",
    poor: "The shouting stops. Two short streets shine, and the miller's children still walk home in the dark.",
  },
  lore: {
    line: "Prioritize by impact, not by who shouts loudest.",
    sourceTitle: "Lenny's Podcast: Shreyas Doshi on prioritization and opportunity cost",
    sourceUrl: "https://www.lennysnewsletter.com/p/episode-3-shreyas-doshi",
  },
  rubric: {
    lesson: "Prioritize by impact, not by who shouts loudest.",
    tiers: {
      wise: "Decides where the lanterns go by who benefits most: finds out how many people use each street, how dark or dangerous it is, or what harm the dark causes, and places the lanterns there regardless of who is asking.",
      muddled:
        "Tries to be fair or keep the peace without measuring need: splits between the loud and the needy, draws lots, rotates the lanterns, or picks a sensible-sounding place with no way of knowing it helps the most people.",
      poor: "Gives the lanterns to whoever demands them most, to the most important people, or to the first to ask. Also any answer that ignores the question.",
    },
    examples: {
      wise: [
        "Walk the village after dark and see which streets people actually use, then put them where the most people pass.",
        "Ask where people have been hurt at night and light those two spots first.",
      ],
      muddled: [
        "Put them in the main square so everyone gets a bit of light.",
        "Let the villagers vote on which two streets get them.",
      ],
      poor: [
        "Give one to the blacksmith, he has been yelling since noon.",
        "Keep one for my own house and hand the other to the mayor.",
      ],
    },
  },
};
