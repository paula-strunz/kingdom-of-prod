import { expect, test, type Page } from "@playwright/test";
import { endings, quests } from "../../src/content";
import type { Tier } from "../../src/engine/types";

const LANTERN: Record<Tier, string> = { wise: "lit", muddled: "dim", poor: "dark" };

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

async function begin(page: Page) {
  await page.goto("/");
  await button(page, "Begin").click();
}

async function finishQuest(page: Page, index: number, tier: Tier) {
  const quest = quests[index]!;
  await expect(page.getByText(quest.reactions[tier])).toBeVisible();
  await button(page, "Read the lore").click();
  await expect(page.getByText(quest.lore.line)).toBeVisible();
  await expect(page.getByRole("link", { name: quest.lore.sourceTitle })).toHaveAttribute(
    "href",
    quest.lore.sourceUrl,
  );
  await page.getByRole("button", { name: /^(Continue|See what became of Hollowmere)$/ }).click();
}

async function playQuest(page: Page, index: number, tier: Tier) {
  const quest = quests[index]!;
  await expect(page.getByRole("heading", { name: quest.title })).toBeVisible();
  await expect(page.getByRole("img", { name: quest.scene.alt })).toBeVisible();
  await button(page, "What will you do?").click();
  await button(page, quest.choices.find((c) => c.tier === tier)!.label).click();
  await finishQuest(page, index, tier);
}

for (const [tier, ending] of [
  ["wise", "thrives"],
  ["muddled", "muddles"],
  ["poor", "fog"],
] as const) {
  test(`five ${tier} choices end in "${endings[ending].title}" without calling the judge`, async ({
    page,
  }) => {
    let judgeCalls = 0;
    await page.route("**/api/judge", (route) => {
      judgeCalls++;
      return route.abort();
    });

    await begin(page);
    for (let i = 0; i < quests.length; i++) await playQuest(page, i, tier);

    await expect(page.getByRole("heading", { name: endings[ending].title })).toBeVisible();
    const lanterns = page.getByTestId("lantern");
    await expect(lanterns).toHaveCount(quests.length);
    for (let i = 0; i < quests.length; i++) {
      await expect(lanterns.nth(i)).toHaveAttribute("data-state", LANTERN[tier]);
    }
    for (const quest of quests) await expect(page.getByText(quest.lore.line)).toBeVisible();
    expect(judgeCalls).toBe(0);

    await button(page, "Play again").click();
    await expect(page.getByRole("heading", { name: "Kingdom of Prod" })).toBeVisible();
  });
}

test("each lantern keeps the state of its quest", async ({ page }) => {
  const tiers: Tier[] = ["wise", "poor", "muddled", "wise", "wise"];
  await begin(page);
  const lanterns = page.getByTestId("lantern");
  await expect(lanterns.nth(0)).toHaveAttribute("data-state", "empty");
  for (let i = 0; i < tiers.length; i++) await playQuest(page, i, tiers[i]!);
  for (let i = 0; i < tiers.length; i++) {
    await expect(lanterns.nth(i)).toHaveAttribute("data-state", LANTERN[tiers[i]!]);
  }
  // 1 - 1 + 0 + 1 + 1 = 2
  await expect(page.getByRole("heading", { name: endings.muddles.title })).toBeVisible();
});

test("a whispered answer shows the reaction of the tier the judge returns", async ({ page }) => {
  let body: unknown;
  await page.route("**/api/judge", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { tier: "muddled" } });
  });

  await begin(page);
  await button(page, "What will you do?").click();
  await expect(page.getByText("It is not saved.")).toBeVisible();
  await page.getByLabel("Or whisper your own answer").fill("Let the villagers vote.");
  await button(page, "Whisper").click();

  await finishQuest(page, 0, "muddled");
  expect(body).toEqual({ questId: quests[0]!.id, answer: "Let the villagers vote." });
  await expect(page.getByTestId("lantern").nth(0)).toHaveAttribute("data-state", "dim");
});

for (const [name, reply] of [
  ["an error", { status: 502, json: { error: "judge_unavailable" } }],
  ["something that is not a tier", { json: { tier: "brilliant" } }],
] as const) {
  test(`when the judge returns ${name}, the player falls back to the written choices`, async ({
    page,
  }) => {
    await page.route("**/api/judge", (route) => route.fulfill(reply));

    await begin(page);
    await button(page, "What will you do?").click();
    await page.getByLabel("Or whisper your own answer").fill("Hmm.");
    await button(page, "Whisper").click();

    await expect(
      page.getByRole("alert").filter({ hasText: "The fog swallowed your words" }),
    ).toHaveText("The fog swallowed your words. Choose one of the three paths.");
    await expect(page.getByLabel("Or whisper your own answer")).toHaveCount(0);
    await expect(page.getByTestId("lantern").nth(0)).toHaveAttribute("data-state", "empty");

    const quest = quests[0]!;
    await button(page, quest.choices.find((c) => c.tier === "wise")!.label).click();
    await finishQuest(page, 0, "wise");

    // The whisper is offered again on the next quest.
    await button(page, "What will you do?").click();
    await expect(page.getByLabel("Or whisper your own answer")).toBeVisible();
  });
}

test("the whisper field stops at 280 characters", async ({ page }) => {
  await begin(page);
  await button(page, "What will you do?").click();
  const field = page.getByLabel("Or whisper your own answer");
  await expect(button(page, "Whisper")).toBeDisabled();
  await field.fill("x".repeat(400));
  await expect(field).toHaveValue("x".repeat(280));
});

test("a quest can be played with the keyboard alone", async ({ page }) => {
  const quest = quests[0]!;
  async function tabTo(name: string) {
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
      if (focused === name) return;
    }
    throw new Error(`Could not reach "${name}" with Tab`);
  }

  await page.goto("/");
  for (const name of [
    "Begin",
    "What will you do?",
    quest.choices.find((c) => c.tier === "wise")!.label,
    "Read the lore",
    "Continue",
  ]) {
    await tabTo(name);
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("heading", { name: quests[1]!.title })).toBeVisible();
});

test("mute is on every screen and stays on", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: /^Sound (on|off)$/ });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");

  await button(page, "Begin").click();
  for (let i = 0; i < quests.length; i++) {
    await expect(sound).toHaveAttribute("aria-pressed", "true");
    await playQuest(page, i, "wise");
  }
  await expect(sound).toHaveAttribute("aria-pressed", "true");
});

test("a full game leaves no cookies or stored data", async ({ page, context }) => {
  await begin(page);
  for (let i = 0; i < quests.length; i++) await playQuest(page, i, "wise");
  await expect(page.getByRole("heading", { name: endings.thrives.title })).toBeVisible();

  expect(await context.cookies()).toEqual([]);
  const stored = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    databases: (await indexedDB.databases()).length,
  }));
  expect(stored).toEqual({ local: 0, session: 0, databases: 0 });
});
