/**
 * "The game fits the screen" (spec 9.1, acceptance criteria 21 and 22).
 *
 * Plays one full game on each screen size in playwright.config.ts, and on every
 * beat checks that nothing scrolls and that everything is on screen: the
 * lanterns, the mute button, the title, the scene, the text and the buttons.
 */
import { expect, test, type Page } from "@playwright/test";
import { quests } from "../../src/content";

const button = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name, exact: typeof name === "string" });

/** Waits until the beat has arrived: its entrance animations are over. */
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

async function fits(page: Page, beat: string) {
  await settled(page);
  const problems = await page.evaluate(() => {
    const found: string[] = [];
    const screen = { width: window.innerWidth, height: window.innerHeight };

    // Nothing scrolls: not the page, and not a box inside it.
    const root = document.scrollingElement!;
    if (root.scrollHeight > screen.height + 1) found.push(`the page is ${root.scrollHeight}px high on a ${screen.height}px screen`);
    if (root.scrollWidth > screen.width + 1) found.push(`the page is ${root.scrollWidth}px wide on a ${screen.width}px screen`);
    for (const el of document.querySelectorAll("main, main *")) {
      const overflow = getComputedStyle(el).overflowY;
      if ((overflow === "auto" || overflow === "scroll") && el.scrollHeight > el.clientHeight + 1 && el.tagName !== "TEXTAREA") {
        found.push(`a box scrolls inside: ${el.scrollHeight}px of content in ${el.clientHeight}px`);
      }
    }

    // Everything is on screen.
    const parts = document.querySelectorAll("main button, main h1, main h2, main p, main li, main a, main textarea, main svg[role=img]");
    for (const el of parts) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const inside = box.top >= -1 && box.left >= -1 && box.bottom <= screen.height + 1 && box.right <= screen.width + 1;
      if (!inside) {
        const name = el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 40);
        found.push(`off screen: ${el.tagName.toLowerCase()} "${name}" (${Math.round(box.top)} to ${Math.round(box.bottom)} of ${screen.height})`);
      }
    }

    // The scene is still a picture, not a sliver.
    const scene = document.querySelector("main svg[role=img]");
    if (scene && scene.getBoundingClientRect().height < 70) {
      found.push(`the scene is only ${Math.round(scene.getBoundingClientRect().height)}px high`);
    }
    return found;
  });
  expect(problems, beat).toEqual([]);
}

test("a full game fits the screen on every beat, with no scrolling", async ({ page }) => {
  await page.route("**/api/judge", (route) => route.fulfill({ json: { tier: "wise" } }));

  await page.goto("/");
  await fits(page, "title");
  await button(page, "Begin").click();

  for (const [i, quest] of quests.entries()) {
    const at = `quest ${i + 1}`;
    await expect(page.getByRole("heading", { name: quest.place.name })).toBeVisible();
    await fits(page, `${at}: map`);

    await button(page, "Arrive").click();
    await expect(page.getByRole("heading", { name: quest.title })).toBeVisible();
    await fits(page, `${at}: scene`);

    await button(page, "What will you do?").click();
    await fits(page, `${at}: decision`);

    // The longest reaction of the three is the one that must fit.
    const longest = [...quest.choices].sort(
      (a, b) => quest.reactions[b.tier].length - quest.reactions[a.tier].length,
    )[0]!;
    if (i === 0) {
      await button(page, "Whisper your own answer").click();
      await fits(page, `${at}: whisper`);
      await page.reload();
      await button(page, "Begin").click();
      await button(page, "Arrive").click();
      await button(page, "What will you do?").click();
    }
    await button(page, longest.label).click();
    await expect(page.getByText(quest.reactions[longest.tier])).toBeVisible();
    await fits(page, `${at}: reaction`);

    await button(page, "Read the lore").click();
    await expect(page.getByText(quest.lore.line)).toBeVisible();
    await fits(page, `${at}: lore`);
    await button(page, /^(Continue|See what became of Hollowmere)$/).click();
  }

  await expect(button(page, "What you learned")).toBeVisible();
  await fits(page, "ending");
  await button(page, "What you learned").click();
  await expect(button(page, "Play again")).toBeVisible();
  await fits(page, "lessons");
});
