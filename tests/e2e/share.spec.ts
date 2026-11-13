/** The tab icon and the link preview (spec acceptance criterion 23). */
import { expect, test } from "@playwright/test";

test("the page declares its icons and its link preview, and the files load", async ({ page, request }) => {
  await page.goto("/");
  const attr = (selector: string, name: string) => page.locator(selector).first().getAttribute(name);

  expect(await attr('meta[property="og:title"]', "content")).toBe("Kingdom of Prod");
  expect(await attr('meta[property="og:description"]', "content")).toContain("spooky");
  expect(await attr('meta[property="og:image:width"]', "content")).toBe("1200");
  expect(await attr('meta[property="og:image:height"]', "content")).toBe("630");
  expect(await attr('meta[property="og:image:alt"]', "content")).toContain("lantern");
  expect(await attr('meta[name="twitter:card"]', "content")).toBe("summary_large_image");

  const files = {
    "the tab icon": [await attr('link[rel="icon"]', "href"), "image/svg+xml"],
    "the home-screen icon": [await attr('link[rel="apple-touch-icon"]', "href"), "image/png"],
    "the preview image": [await attr('meta[property="og:image"]', "content"), "image/png"],
    "the Twitter image": [await attr('meta[name="twitter:image"]', "content"), "image/png"],
  } as const;
  for (const [name, [href, type]] of Object.entries(files)) {
    expect(href, name).toBeTruthy();
    // The preview images are declared with the production address; fetch them from this server.
    const url = new URL(href!, "http://localhost");
    const response = await request.get(url.pathname + url.search);
    expect(response.status(), name).toBe(200);
    expect(response.headers()["content-type"], name).toContain(type);
  }
});
