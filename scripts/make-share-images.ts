/**
 * Makes the images a shared link and a phone's home screen show (plan.md, section 8e):
 *
 *   app/opengraph-image.png  1200 x 630, the gate scene with the title over the sky
 *   app/twitter-image.png    the same image
 *   app/apple-icon.png       180 x 180, from app/icon.svg
 *
 * It photographs a running copy of the game, so the picture is the real scene.
 * Run it again when the art changes:
 *
 *   npm run dev                                (in another terminal)
 *   npx tsx scripts/make-share-images.ts       (or pass another address)
 */
import { copyFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const app = path.join(path.dirname(fileURLToPath(import.meta.url)), "../app");
const address = process.argv[2] ?? "http://localhost:3000";

const SHARE_STYLE = `
  /* Of the page's own night sky, keep only the sky and the color of the place. */
  body > [aria-hidden="true"] > :not(:first-child):not([data-testid]) { display: none !important; }
  main > header, [data-world] > :not(:has(svg[data-scene])) { display: none !important; }
  [data-world] > :has(svg[data-scene]) {
    position: fixed; left: 0; right: 0; bottom: 0; height: 440px; margin: 0; flex: none;
  }
  #share-title {
    position: fixed; z-index: 5; left: 0; right: 0; top: 34px; text-align: center;
    text-shadow: 0 0 24px #150c1e, 0 0 8px #150c1e;
  }
  #share-title b {
    display: block; font: 400 104px/1 var(--font-display); color: var(--color-amber);
    text-shadow: 0 0 40px rgb(255 199 107 / 0.4), 0 4px 0 var(--color-ink);
  }
  #share-title span {
    display: block; margin-top: 18px; font: 400 34px/1.2 var(--font-story); color: var(--color-parchment);
  }
`;

async function main() {
  const browser = await chromium.launch();

  // The link preview: the first scene, at rest, with the title set over its sky.
  const share = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  await share.goto(address);
  await share.getByRole("button", { name: "Begin" }).click();
  await share.getByRole("button", { name: "Arrive" }).click();
  await share.locator("svg[data-scene]").waitFor();
  await share.addStyleTag({ content: SHARE_STYLE });
  await share.evaluate(() => {
    const title = document.createElement("div");
    title.id = "share-title";
    title.innerHTML = "<b>Kingdom of Prod</b><span>A 10-minute spooky story game about product decisions</span>";
    document.body.append(title);
  });
  await share.evaluate(() => document.fonts.ready);
  await share.waitForTimeout(500);
  await share.screenshot({ path: path.join(app, "opengraph-image.png") });
  copyFileSync(path.join(app, "opengraph-image.png"), path.join(app, "twitter-image.png"));

  // The home-screen icon: the tab icon with square corners. The phone rounds them itself.
  const square = readFileSync(path.join(app, "icon.svg"), "utf8").replace('rx="6"', "").replace(
    /<path d="M0 26h32[^>]*>/,
    '<rect y="26" width="32" height="6" fill="#150c1e"/>',
  );
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await icon.setContent(`<body style="margin:0">${square}</body>`);
  await icon.screenshot({ path: path.join(app, "apple-icon.png") });

  await browser.close();
  console.log("Wrote opengraph-image.png, twitter-image.png and apple-icon.png to app/");
}

void main();
