import {
  TIER_VALUE,
  type Action,
  type EndingId,
  type EngineQuest,
  type GameState,
  type Tier,
} from "./types";

export const initialState: GameState = {
  phase: "title",
  questIndex: 0,
  tiers: [],
  muted: false,
  whisperBlocked: false,
};

export function reputation(tiers: readonly Tier[]): number {
  return tiers.reduce((sum, tier) => sum + TIER_VALUE[tier], 0);
}

export function endingFor(rep: number): EndingId {
  if (rep >= 3) return "thrives";
  if (rep >= 0) return "muddles";
  return "fog";
}

/** Pure game reducer. An action that does not fit the current phase is ignored. */
export function reduce(
  state: GameState,
  action: Action,
  quests: readonly EngineQuest[],
): GameState {
  if (action.type === "toggleMute") return { ...state, muted: !state.muted };
  if (action.type === "restart") return { ...initialState, muted: state.muted };

  switch (state.phase) {
    case "title":
      return action.type === "begin" && quests.length > 0
        ? { ...state, phase: "scene" }
        : state;

    case "scene":
      return action.type === "showDecision" ? { ...state, phase: "decision" } : state;

    case "decision": {
      if (action.type === "choose") {
        const choice = quests[state.questIndex]?.choices.find(
          (c) => c.id === action.choiceId,
        );
        if (!choice) return state;
        return { ...state, phase: "reaction", tiers: [...state.tiers, choice.tier] };
      }
      if (action.type === "whisper" && !state.whisperBlocked) {
        return { ...state, phase: "judging" };
      }
      return state;
    }

    case "judging":
      if (action.type === "judged") {
        return { ...state, phase: "reaction", tiers: [...state.tiers, action.tier] };
      }
      if (action.type === "judgeFailed") {
        return { ...state, phase: "decision", whisperBlocked: true };
      }
      return state;

    case "reaction":
      return action.type === "showLore" ? { ...state, phase: "lore" } : state;

    case "lore": {
      if (action.type !== "continue") return state;
      const next = state.questIndex + 1;
      return next >= quests.length
        ? { ...state, phase: "ending", whisperBlocked: false }
        : { ...state, phase: "scene", questIndex: next, whisperBlocked: false };
    }

    case "ending":
      return state;
  }
}
