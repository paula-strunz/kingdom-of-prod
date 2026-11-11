import type { Quest } from "../schema";

export const baronsRaven: Quest = {
  id: "barons-raven",
  title: "The Baron's Raven",
  scene: {
    id: "barons-raven",
    alt: "A raven on a windowsill holding a sealed letter. Beyond it, a sagging wooden bridge over a misty river.",
  },
  story: [
    "A raven lands on your sill with a sealed note from the Baron.",
    "\"Build my statue in the square before you touch the bridge.\"",
    "The bridge planks are rotting, and the harvest carts cross them every day.",
  ],
  choices: [
    { id: "statue", label: "Build the statue first", tier: "poor" },
    { id: "refuse", label: "Send the raven back with one word: no", tier: "muddled" },
    {
      id: "evidence",
      label: "Send back the count of carts that cross the bridge, and offer the statue after harvest",
      tier: "wise",
    },
  ],
  reactions: {
    wise: "The raven returns with a shorter note. \"Forty carts a day. Very well. Bridge first, and make the statue tall.\"",
    muddled:
      "The bridge gets mended. The Baron stops answering your letters, and the winter grain he promised arrives late.",
    poor: "The statue is handsome. In the second week of harvest a cart goes through the bridge, and the pumpkins float downstream past the Baron's stone face.",
  },
  lore: {
    line: "Say no with evidence and an alternative.",
    sourceTitle: "Lenny's Podcast: Wes Kao on persuasive communication and managing up",
    sourceUrl: "https://www.lennysnewsletter.com/p/persuasive-communication-wes-kao",
  },
  rubric: {
    lesson: "Say no with evidence and an alternative.",
    tiers: {
      wise: "Declines to put the statue first and gives the Baron both a reason grounded in facts (the carts, the harvest, the danger of the bridge) and another way to get what he wants (the statue later, smaller, or somewhere else).",
      muddled:
        "Protects the bridge but is missing one half: refuses with no reason, gives a reason with no alternative, quietly ignores the order, or tries to do both at once with no plan for how.",
      poor: "Obeys and builds the statue first, or answers the Baron with insults or threats. Also any answer that ignores the question.",
    },
    examples: {
      wise: [
        "Tell him the harvest pays for his statue, and the harvest needs the bridge. Statue in November.",
        "Invite the Baron to watch the carts cross the bridge, then propose we start his statue once it is safe.",
      ],
      muddled: [
        "Fix the bridge and hope he does not notice.",
        "Write back that the bridge is dangerous and we cannot do the statue.",
      ],
      poor: [
        "He is the Baron. Statue it is.",
        "Shoo the raven away and tell the Baron to carve it himself.",
      ],
    },
  },
};
