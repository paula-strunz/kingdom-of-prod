/**
 * The accessibility pass (tasks.md, T028): every kind of screen is scanned with
 * axe for WCAG 2 A and AA, every control is big enough to tap, and the keyboard
 * focus can be seen.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { quests } from "../../src/content";

const TAP_MIN = 44;

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

/** Waits until every entrance animation is over: axe cannot judge the contrast of text that is fading in. */
async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
          .every((a) => a.playState === "finished"),
      ),
    )
    .toBe(true);
}

async function check(page: Page, screen: string) {
  await settled(page);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.passes.length, `${screen}: axe ran`).toBeGreaterThan(5);
  const violations = results.violations.map((v) => `${screen}: ${v.id} at ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(violations).toEqual([]);

  const small = await page.evaluate((min) => {
    return [...document.querySelectorAll("button, textarea")]
      .map((el) => ({ name: el.textContent?.trim() || el.id, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 0 && (box.width < min || box.height < min))
      .map(({ name, box }) => `${name}: ${Math.round(box.width)} x ${Math.round(box.height)}`);
  }, TAP_MIN);
  expect(small, `${screen}: controls smaller than ${TAP_MIN}px`).toEqual([]);
}

test("every screen passes axe, and every control is big enough to tap", async ({ page }) => {
  await page.route("**/api/judge", (route) => route.fulfill({ json: { tier: "muddled" } }));
  const quest = quests[0]!;

  await page.goto("/");
  await check(page, "title");

  await button(page, "Begin").click();
  await expect(page.getByRole("heading", { name: quest.place.name })).toBeVisible();
  await check(page, "map");

  await button(page, "Arrive").click();
  await expect(page.getByRole("heading", { name: quest.title })).toBeVisible();
  await check(page, "scene");

  await button(page, "What will you do?").click();
  await check(page, "decision");

  await button(page, "Whisper your own answer").click();
  await page.getByLabel("Or whisper your own answer").fill("Ask who walks the lanes after dark.");
  await check(page, "whisper");

  await button(page, "Whisper").click();
  await expect(page.getByText(quest.reactions.muddled)).toBeVisible();
  await check(page, "reaction");

  await button(page, "Read the lore").click();
  await expect(page.getByText(quest.lore.line)).toBeVisible();
  await check(page, "lore");
});

test("the ending passes axe", async ({ page }) => {
  await page.goto("/");
  await button(page, "Begin").click();
  for (const quest of quests) {
    await button(page, "Arrive").click();
    await button(page, "What will you do?").click();
    await button(page, quest.choices[0]!.label).click();
    await button(page, "Read the lore").click();
    await page.getByRole("button", { name: /^(Continue|See what became of Hollowmere)$/ }).click();
  }
  await expect(button(page, "Play again")).toBeVisible();
  await check(page, "ending");
});

test("the keyboard focus can be seen on every control", async ({ page }) => {
  await page.goto("/");
  await button(page, "Begin").click();
  await button(page, "Arrive").click();
  await button(page, "What will you do?").click();
  await button(page, "Whisper your own answer").click();

  const count = await page.locator("button, textarea").count();
  expect(count).toBeGreaterThan(4);
  const seen = new Set<string>();
  for (let i = 0; i < count + 2; i++) {
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return { name: el.textContent?.trim() || el.id, style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });
    if (!ring) continue;
    seen.add(ring.name);
    expect(ring.style, `focus ring on "${ring.name}"`).not.toBe("none");
    expect(ring.width, `focus ring on "${ring.name}"`).toBeGreaterThanOrEqual(2);
  }
  expect(seen.size).toBeGreaterThan(4);
});
