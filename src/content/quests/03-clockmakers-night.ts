import type { Quest } from "../schema";

export const clockmakersNight: Quest = {
  id: "clockmakers-night",
  title: "The Clockmaker's Night",
  scene: {
    id: "clockmakers-night",
    alt: "A clockmaker's bench by candlelight, covered in gears and brass chimes. Through the window, a nearly full moon.",
  },
  story: [
    "The festival clock lies in pieces on the clockmaker's bench. The harvest moon rises in three nights.",
    "\"The hands will turn by then,\" he says. \"The chimes will not. Unless I stop sleeping.\"",
  ],
  choices: [
    { id: "cut", label: "Cut the chimes and have the clock ready for the moon", tier: "wise" },
    { id: "delay", label: "Delay the clock until all of it is done", tier: "muddled" },
    { id: "rush", label: "Tell him to rush all of it", tier: "poor" },
  ],
  reactions: {
    wise: "The clock keeps time under the harvest moon, silent and exact. The chimes arrive a week later, and the village cheers a second time.",
    muddled:
      "The festival opens under an empty tower. The finished clock is beautiful, and it strikes its first hour over a square of swept-up leaves.",
    poor: "The clock is up by moonrise. At midnight it strikes thirteen, coughs out a spring, and stops.",
  },
  lore: {
    line: "Ship a smaller thing on time.",
    sourceTitle: "Lenny's Podcast: Ryan Singer, creator of Shape Up, on planning and shipping",
    sourceUrl: "https://www.lennysnewsletter.com/p/shape-up-ryan-singer",
  },
  rubric: {
    lesson: "Ship a smaller thing on time.",
    tiers: {
      wise: "Keeps the date and cuts scope: delivers a working clock for the harvest moon without the chimes or with something simpler in their place, and may add the rest later.",
      muddled:
        "Protects quality or the clockmaker by moving the date: delays the clock or the festival, or waits until everything is finished. Nothing breaks, but the moment is missed.",
      poor: "Keeps both the full scope and the date by pushing harder: rushing, skipping sleep, adding helpers at the last minute, or skipping the testing. Also any answer that ignores the question.",
    },
    examples: {
      wise: [
        "A clock that tells the time is enough for the festival. Chimes can come after.",
        "Ring the church bell by hand on the night and finish the chimes next week.",
      ],
      muddled: [
        "Better late than broken. Hold the festival when the clock is done.",
        "Give him two more weeks so he can do it properly.",
      ],
      poor: [
        "Send him three apprentices tonight and tell them to get it all done.",
        "He can sleep after the festival.",
      ],
    },
  },
};
