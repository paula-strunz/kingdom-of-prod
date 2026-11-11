import { z } from "zod";
import { TIERS, type Tier } from "../engine/types";

export const verdictSchema = z.object({ tier: z.enum(TIERS) });

/** Returns the tier only if the value is exactly a verdict. Never guesses. */
export function parseTier(value: unknown): Tier | null {
  const result = verdictSchema.strict().safeParse(value);
  return result.success ? result.data.tier : null;
}
