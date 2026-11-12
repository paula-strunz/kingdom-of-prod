/** Release check: every lore source link must still resolve. */
import { quests } from "../src/content";

const results = await Promise.all(
  quests.map(async ({ id, lore }) => {
    try {
      const response = await fetch(lore.sourceUrl, {
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (link check)" },
        signal: AbortSignal.timeout(15_000),
      });
      return { id, url: lore.sourceUrl, ok: response.ok, status: String(response.status) };
    } catch (error) {
      return { id, url: lore.sourceUrl, ok: false, status: String(error) };
    }
  }),
);

for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.status} ${r.id} ${r.url}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
