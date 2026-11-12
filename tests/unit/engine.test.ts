import { describe, expect, it } from "vitest";
import { endingFor, initialState, reduce, reputation } from "../../src/engine/engine";
import type { Action, EngineQuest, GameState, Tier } from "../../src/engine/types";

const quest: EngineQuest = {
  choices: [
    { id: "w", tier: "wise" },
    { id: "m", tier: "muddled" },
    { id: "p", tier: "poor" },
  ],
};
const quests = Array.from({ length: 5 }, () => quest);
const choiceFor: Record<Tier, string> = { wise: "w", muddled: "m", poor: "p" };

const run = (state: GameState, ...actions: Action[]) =>
  actions.reduce((s, a) => reduce(s, a, quests), state);

function play(tiers: Tier[]): GameState {
  let state = run(initialState, { type: "begin" });
  for (const tier of tiers) {
    state = run(
      state,
      { type: "arrive" },
      { type: "showDecision" },
      { type: "choose", choiceId: choiceFor[tier] },
      { type: "showLore" },
      { type: "continue" },
    );
  }
  return state;
}

describe("a quest", () => {
  it("moves through travel, scene, decision, reaction and lore", () => {
    let state = run(initialState, { type: "begin" });
    expect(state.phase).toBe("travel");
    state = run(state, { type: "arrive" });
    expect(state.phase).toBe("scene");
    state = run(state, { type: "showDecision" });
    expect(state.phase).toBe("decision");
    state = run(state, { type: "choose", choiceId: "w" });
    expect(state).toMatchObject({ phase: "reaction", tiers: ["wise"] });
    state = run(state, { type: "showLore" });
    expect(state.phase).toBe("lore");
    state = run(state, { type: "continue" });
    expect(state).toMatchObject({ phase: "travel", questIndex: 1 });
    expect(run(state, { type: "arrive" })).toMatchObject({ phase: "scene", questIndex: 1 });
  });

  it("ignores actions that do not fit the phase", () => {
    expect(run(initialState, { type: "choose", choiceId: "w" })).toEqual(initialState);
    const travel = run(initialState, { type: "begin" });
    expect(run(travel, { type: "showDecision" })).toEqual(travel);
    const scene = run(travel, { type: "arrive" });
    expect(run(scene, { type: "arrive" })).toEqual(scene);
    expect(run(scene, { type: "continue" })).toEqual(scene);
    expect(run(scene, { type: "judged", tier: "wise" })).toEqual(scene);
    const reaction = run(scene, { type: "showDecision" }, { type: "choose", choiceId: "w" });
    expect(run(reaction, { type: "choose", choiceId: "p" })).toEqual(reaction);
  });

  it("ignores an unknown choice", () => {
    const decision = run(initialState, { type: "begin" }, { type: "arrive" }, { type: "showDecision" });
    expect(run(decision, { type: "choose", choiceId: "nope" })).toEqual(decision);
  });
});

describe("the whisper", () => {
  const decision = run(
    initialState,
    { type: "begin" },
    { type: "arrive" },
    { type: "showDecision" },
  );

  it("takes the tier the judge returns", () => {
    const state = run(decision, { type: "whisper" }, { type: "judged", tier: "muddled" });
    expect(state).toMatchObject({ phase: "reaction", tiers: ["muddled"] });
  });

  it("falls back to the written choices when the judge fails, and never guesses a tier", () => {
    const failed = run(decision, { type: "whisper" }, { type: "judgeFailed" });
    expect(failed).toMatchObject({ phase: "decision", whisperBlocked: true, tiers: [] });
    expect(run(failed, { type: "whisper" })).toEqual(failed);
    expect(run(failed, { type: "choose", choiceId: "w" }).phase).toBe("reaction");
  });

  it("is offered again on the next quest", () => {
    const next = run(
      decision,
      { type: "whisper" },
      { type: "judgeFailed" },
      { type: "choose", choiceId: "w" },
      { type: "showLore" },
      { type: "continue" },
    );
    expect(next.whisperBlocked).toBe(false);
  });
});

describe("endings", () => {
  it.each([
    ["wise", "thrives"],
    ["muddled", "muddles"],
    ["poor", "fog"],
  ] as const)("five %s answers end in %s", (tier, ending) => {
    const state = play(Array<Tier>(5).fill(tier));
    expect(state.phase).toBe("ending");
    expect(endingFor(reputation(state.tiers))).toBe(ending);
  });

  it.each([
    [5, "thrives"],
    [3, "thrives"],
    [2, "muddles"],
    [0, "muddles"],
    [-1, "fog"],
    [-5, "fog"],
  ] as const)("reputation %i ends in %s", (rep, ending) => {
    expect(endingFor(rep)).toBe(ending);
  });

  it("sums reputation from tiers", () => {
    expect(reputation(["wise", "wise", "muddled", "poor", "wise"])).toBe(2);
  });

  it("does nothing after the ending except restart", () => {
    const end = play(Array<Tier>(5).fill("wise"));
    expect(run(end, { type: "continue" })).toEqual(end);
    expect(run(end, { type: "restart" })).toEqual(initialState);
  });
});

describe("mute", () => {
  it("toggles in any phase and survives a restart", () => {
    const muted = run(initialState, { type: "toggleMute" });
    expect(muted.muted).toBe(true);
    const end = play(Array<Tier>(5).fill("poor"));
    const restarted = run(end, { type: "toggleMute" }, { type: "restart" });
    expect(restarted).toEqual({ ...initialState, muted: true });
  });
});
