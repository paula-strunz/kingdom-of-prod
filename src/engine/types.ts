export const TIERS = ["wise", "muddled", "poor"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_VALUE: Record<Tier, number> = { wise: 1, muddled: 0, poor: -1 };

export type Phase =
  | "title"
  | "travel"
  | "scene"
  | "decision"
  | "judging"
  | "reaction"
  | "lore"
  | "ending";

export type EndingId = "thrives" | "muddles" | "fog";

export type GameState = {
  phase: Phase;
  questIndex: number;
  /** One tier per finished quest, in order. */
  tiers: Tier[];
  muted: boolean;
  /** True after the judge failed on the current quest: only written choices remain. */
  whisperBlocked: boolean;
};

export type Action =
  | { type: "begin" }
  | { type: "arrive" }
  | { type: "showDecision" }
  | { type: "choose"; choiceId: string }
  | { type: "whisper" }
  | { type: "judged"; tier: Tier }
  | { type: "judgeFailed" }
  | { type: "showLore" }
  | { type: "continue" }
  | { type: "restart" }
  | { type: "toggleMute" };

/** The part of a quest the engine needs. */
export type EngineQuest = { choices: { id: string; tier: Tier }[] };
