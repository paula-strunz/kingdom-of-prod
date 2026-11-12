import { expect, test, type Page } from "@playwright/test";
import { endings, quests } from "../../src/content";
import type { Tier } from "../../src/engine/types";

const LANTERN: Record<Tier, string> = { wise: "lit", muddled: "dim", poor: "dark" };

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

const openWhisper = (page: Page) => button(page, "Whisper your own answer").click();

const scene = (page: Page, index: number) =>
  page.getByRole("img", { name: quests[index]!.scene.alt });

/** The travel beat: the map, the name of the place, then "Arrive". */
async function arrive(page: Page, index: number) {
  const quest = quests[index]!;
  await expect(page.getByRole("heading", { name: quest.place.name })).toBeVisible();
  await expect(page.getByRole("img", { name: /^Map of Hollowmere/ })).toHaveAttribute(
    "data-map",
    String(index),
  );
  await expect(page.getByText(quest.place.road)).toBeVisible();
  await button(page, "Arrive").click();
}

/** Starts a game and walks to the first place. */
async function begin(page: Page) {
  await page.goto("/");
  await button(page, "Begin").click();
  await arrive(page, 0);
}

async function finishQuest(page: Page, index: number, tier: Tier) {
  const quest = quests[index]!;
  await expect(page.getByText(quest.reactions[tier])).toBeVisible();
  // The scene is still on screen, and now shows what this tier led to.
  await expect(scene(page, index)).toHaveAttribute("data-outcome", tier);
  await button(page, "Read the lore").click();
  await expect(page.getByText(quest.lore.line)).toBeVisible();
  await expect(scene(page, index)).toHaveAttribute("data-outcome", tier);
  await expect(page.getByRole("link", { name: quest.lore.sourceTitle })).toHaveAttribute(
    "href",
    quest.lore.sourceUrl,
  );
  await page.getByRole("button", { name: /^(Continue|See what became of Hollowmere)$/ }).click();
  if (index + 1 < quests.length) await arrive(page, index + 1);
}

async function playQuest(page: Page, index: number, tier: Tier) {
  const quest = quests[index]!;
  await expect(page.getByRole("heading", { name: quest.title })).toBeVisible();
  await expect(scene(page, index)).toHaveAttribute("data-outcome", "none");
  await expect(scene(page, index).locator("[data-keeper]")).toHaveCount(1);
  await button(page, "What will you do?").click();
  await expect(scene(page, index)).toHaveAttribute("data-outcome", "none");
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
  await openWhisper(page);
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
    await openWhisper(page);
    await page.getByLabel("Or whisper your own answer").fill("Hmm.");
    await button(page, "Whisper").click();

    await expect(
      page.getByRole("alert").filter({ hasText: "The fog swallowed your words" }),
    ).toHaveText("The fog swallowed your words. Choose one of the three paths.");
    await expect(page.getByLabel("Or whisper your own answer")).toHaveCount(0);
    await expect(button(page, "Whisper your own answer")).toHaveCount(0);
    await expect(page.getByTestId("lantern").nth(0)).toHaveAttribute("data-state", "empty");

    const quest = quests[0]!;
    await button(page, quest.choices.find((c) => c.tier === "wise")!.label).click();
    await finishQuest(page, 0, "wise");

    // The whisper is offered again on the next quest.
    await button(page, "What will you do?").click();
    await openWhisper(page);
    await expect(page.getByLabel("Or whisper your own answer")).toBeVisible();
  });
}

test("the whisper field stops at 280 characters", async ({ page }) => {
  await begin(page);
  await button(page, "What will you do?").click();
  await openWhisper(page);
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
    "Arrive",
    "What will you do?",
    quest.choices.find((c) => c.tier === "wise")!.label,
    "Read the lore",
    "Continue",
  ]) {
    await tabTo(name);
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("heading", { name: quests[1]!.place.name })).toBeVisible();
  await tabTo("Arrive");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: quests[1]!.title })).toBeVisible();
});

test("mute is on every screen and stays on", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: /^Sound (on|off)$/ });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");

  await button(page, "Begin").click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await arrive(page, 0);
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

test("each quest is in its own place, and the page takes its color", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).not.toHaveAttribute("data-place");
  await button(page, "Begin").click();
  await arrive(page, 0);

  const colors: string[] = [];
  for (let i = 0; i < quests.length; i++) {
    await expect(page.locator("body")).toHaveAttribute("data-place", quests[i]!.scene.id);
    await expect(page.locator(`svg[data-scene="${quests[i]!.scene.id}"]`)).toBeVisible();
    colors.push(
      await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--place-tint")),
    );
    await playQuest(page, i, "wise");
  }
  expect(colors.every((c) => c.trim() !== "")).toBe(true);
  expect(new Set(colors).size).toBe(quests.length);
  await expect(page.locator("body")).not.toHaveAttribute("data-place");
});

test("the map shows the lantern earned at each finished place", async ({ page }) => {
  const tiers: Tier[] = ["wise", "poor", "muddled"];
  await begin(page);
  for (let i = 0; i < tiers.length; i++) {
    await playQuest(page, i, tiers[i]!);
  }
  // Play the fourth quest by hand, to stop on the map on the way to the fifth.
  await button(page, "What will you do?").click();
  await button(page, quests[3]!.choices[0]!.label).click();
  await button(page, "Read the lore").click();
  await button(page, "Continue").click();

  const map = page.getByRole("img", { name: /^Map of Hollowmere/ });
  await expect(map).toHaveAttribute("data-map", "4");
  for (let i = 0; i < tiers.length; i++) {
    await expect(map.locator(`[data-stop="${i}"]`)).toHaveAttribute("data-state", tiers[i]!);
  }
  await expect(map.locator('[data-stop="4"]')).toHaveAttribute("data-state", "next");
  await expect(map.locator("[data-keeper]")).toHaveCount(1);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing loops or walks, and every scene still shows its outcome", async ({ page }) => {
    const looping = () =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((a) => a.effect?.getComputedTiming().iterations === Infinity).length,
      );
    const moving = () =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((a) => a instanceof CSSAnimation && !/fade-in/.test(a.animationName)).length,
      );

    await page.goto("/");
    await button(page, "Begin").click();
    expect(await moving()).toBe(0);
    await arrive(page, 0);
    const tiers: Tier[] = ["wise", "muddled", "poor", "wise", "poor"];
    for (let i = 0; i < quests.length; i++) {
      expect(await looping()).toBe(0);
      expect(await moving()).toBe(0);
      await playQuest(page, i, tiers[i]!);
    }
    expect(await looping()).toBe(0);
  });
});

test("the scene is the world: whole, unframed, and as wide as the screen", async ({ page }) => {
  await begin(page);
  const world = scene(page, 0);
  await expect(world.locator("[data-keeper]")).toHaveCount(1);
  // Let the scene finish sliding in.
  await expect
    .poll(() => world.evaluate((el) => el.parentElement!.getAnimations().every((a) => a.playState === "finished")))
    .toBe(true);

  const viewport = page.viewportSize()!;
  const box = (await world.boundingBox())!;
  // As wide as the screen: the place runs from edge to edge, on a phone and on a wide screen.
  expect(box.x).toBeCloseTo(0, 0);
  expect(box.width).toBeCloseTo(viewport.width, 0);
  // Whole: every corner of the 320 x 180 scene is on screen, so nothing of it is cropped.
  const corners = await world.evaluate((el) => {
    const svg = el as SVGSVGElement;
    const matrix = svg.getScreenCTM()!;
    return [
      [0, 0],
      [320, 180],
    ].map(([x, y]) => {
      const p = new DOMPoint(x, y).matrixTransform(matrix);
      return { x: p.x, y: p.y };
    });
  });
  const [topLeft, bottomRight] = corners as [{ x: number; y: number }, { x: number; y: number }];
  expect(topLeft.x).toBeGreaterThanOrEqual(-0.5);
  expect(bottomRight.x).toBeLessThanOrEqual(viewport.width + 0.5);
  expect(topLeft.y).toBeGreaterThanOrEqual(box.y - 0.5);
  expect(bottomRight.y).toBeLessThanOrEqual(box.y + box.height + 0.5);

  // Unframed: nothing between the scene and the page draws a border, an outline, or rounded corners.
  const frames = await world.evaluate((el) => {
    const found: string[] = [];
    for (let node = el.parentElement; node && node.tagName !== "MAIN"; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (parseFloat(style.borderTopWidth) || parseFloat(style.borderTopLeftRadius) || style.boxShadow !== "none") {
        found.push(node.className);
      }
    }
    return found;
  });
  expect(frames).toEqual([]);

  // The dialogue box is below the horizon of the scene: the keeper is not covered.
  const keeper = (await world.locator("[data-keeper]").boundingBox())!;
  const dialogue = (await page.getByRole("button", { name: "What will you do?" }).locator("xpath=ancestor::div[2]").boundingBox())!;
  expect(keeper.y + keeper.height).toBeLessThanOrEqual(dialogue.y + 2);
});
