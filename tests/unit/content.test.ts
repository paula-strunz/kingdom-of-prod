import { describe, expect, it } from "vitest";
import { endings, quests } from "../../src/content";
import { endingSchema, questSchema } from "../../src/content/schema";

describe("quests", () => {
  it("has the five V0 quests in order", () => {
    expect(quests.map((q) => q.id)).toEqual([
      "lantern-pleas",
      "whispering-well",
      "clockmakers-night",
      "barons-raven",
      "counting-fog",
    ]);
  });

  it.each(quests.map((q) => [q.id, q] as const))("%s passes the schema", (_id, quest) => {
    expect(() => questSchema.parse(quest)).not.toThrow();
  });

  it("does not put the wise choice in the same position every time", () => {
    const positions = quests.map((q) => q.choices.findIndex((c) => c.tier === "wise"));
    expect(new Set(positions).size).toBeGreaterThan(1);
  });

  it("keeps rubric examples distinct from the written choices", () => {
    for (const quest of quests) {
      const labels = quest.choices.map((c) => c.label);
      const examples = Object.values(quest.rubric.examples).flat();
      expect(examples.filter((ex) => labels.includes(ex))).toEqual([]);
      expect(new Set(examples).size).toBe(examples.length);
    }
  });
});

describe("schema", () => {
  const valid = quests[0]!;

  it("rejects a quest with two choices of the same tier", () => {
    const choices = valid.choices.map((c) => ({ ...c, tier: "wise" as const }));
    expect(questSchema.safeParse({ ...valid, choices }).success).toBe(false);
  });

  it("rejects a quest with a missing or non-https source", () => {
    for (const sourceUrl of ["", "http://example.com", "not a url"]) {
      const lore = { ...valid.lore, sourceUrl };
      expect(questSchema.safeParse({ ...valid, lore }).success).toBe(false);
    }
  });

  it("rejects a story of one line", () => {
    expect(questSchema.safeParse({ ...valid, story: ["Only one."] }).success).toBe(false);
  });
});

describe("endings", () => {
  it("has all three, each valid", () => {
    expect(Object.keys(endings).sort()).toEqual(["fog", "muddles", "thrives"]);
    for (const ending of Object.values(endings)) {
      expect(() => endingSchema.parse(ending)).not.toThrow();
    }
  });
});
