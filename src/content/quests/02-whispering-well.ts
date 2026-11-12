import type { Quest } from "../schema";

export const whisperingWell: Quest = {
  id: "whispering-well",
  title: "The Whispering Well",
  place: {
    name: "The old well",
    road: "A path of wet stones leads down into the marsh, where the fog sits low and the old well waits.",
  },
  scene: {
    id: "whispering-well",
    alt: "The keeper faces the mayor across an old stone well in the fog. She points down into it. A single bucket hangs from a frayed rope.",
  },
  story: [
    "The mayor meets you at the old well, the one that whispers when the wind is low.",
    "\"The village needs a bigger well,\" she says. \"Start digging before the frost.\"",
  ],
  choices: [
    { id: "widen", label: "Widen the old well a little, as a compromise", tier: "muddled" },
    { id: "dig", label: "Dig the bigger well", tier: "poor" },
    { id: "ask", label: "Ask the mayor why she wants a bigger well", tier: "wise" },
  ],
  reactions: {
    wise: "\"Because of the queue at dawn,\" she says. You watch it the next morning: one bucket, one fraying rope. A second bucket costs a coin, and the queue is gone.",
    muddled:
      "The well is a little wider, and the queue at dawn is just as long. Nobody is sure what the digging was for.",
    poor: "You dig for three weeks. The new well is grand, and the queue at dawn is just as long, because there is still only one bucket.",
  },
  lore: {
    line: "Ask about the problem, not the solution.",
    sourceTitle: "Lenny's Podcast: Teresa Torres on interviewing customers and continuous discovery",
    sourceUrl: "https://www.lennysnewsletter.com/p/teresa-torres-on-how-to-interview",
  },
  rubric: {
    lesson: "Ask about the problem, not the solution.",
    tiers: {
      wise: "Finds out what problem the bigger well is meant to solve before building anything: asks the mayor why, asks or watches the villagers who use the well, or looks for what is actually going wrong.",
      muddled:
        "Does not question the request but softens it: builds something smaller or cheaper, postpones, or asks only about the details of the well (how big, where, what cost) and not about the need behind it.",
      poor: "Builds the bigger well as asked, or picks a different solution with no attempt to learn the problem. Also any answer that ignores the question.",
    },
    examples: {
      wise: [
        "Before anyone digs, I'd stand at the well for a morning and see what goes wrong.",
        "What happened that made her think the well is too small?",
      ],
      muddled: [
        "Ask her how deep and how wide she wants it so we get the size right.",
        "Tell her we will dig it in spring when the ground is softer.",
      ],
      poor: [
        "She is the mayor, so get the shovels.",
        "Forget the well, build a water tower instead.",
      ],
    },
  },
};
