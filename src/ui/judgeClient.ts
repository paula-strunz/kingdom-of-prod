import { TIERS, type Tier } from "../engine/types";

export const JUDGE_TIMEOUT_MS = 8_000;

/** Asks the judge for a tier. Returns null on any failure, timeout, or unexpected reply. */
export async function requestVerdict(questId: string, answer: string): Promise<Tier | null> {
  try {
    const response = await fetch("/api/judge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questId, answer }),
      signal: AbortSignal.timeout(JUDGE_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const tier = (data as { tier?: unknown } | null)?.tier;
    return TIERS.find((t) => t === tier) ?? null;
  } catch {
    return null;
  }
}
