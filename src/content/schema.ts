import { z } from "zod";
import { TIERS } from "../engine/types";

const tier = z.enum(TIERS);
const line = z.string().trim().min(1);
const perTier = <T extends z.ZodType>(value: T) =>
  z.object({ wise: value, muddled: value, poor: value }).strict();

export const WHISPER_MAX_LENGTH = 280;

export const questSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: line,
    scene: z.object({ id: line, alt: line }),
    story: z.array(line).min(2).max(3),
    choices: z
      .array(z.object({ id: line, label: line, tier }))
      .length(3)
      .refine((cs) => new Set(cs.map((c) => c.tier)).size === 3, {
        message: "A quest needs exactly one choice per tier",
      })
      .refine((cs) => new Set(cs.map((c) => c.id)).size === 3, {
        message: "Choice ids must be unique within a quest",
      }),
    reactions: perTier(line),
    lore: z.object({
      line: line.refine((s) => !s.includes("\n"), "Lore is one line"),
      sourceTitle: line,
      sourceUrl: z.url({ protocol: /^https$/ }),
    }),
    rubric: z.object({
      lesson: line,
      tiers: perTier(line),
      examples: perTier(z.array(line.max(WHISPER_MAX_LENGTH)).length(2)),
    }),
  })
  .strict();

export type Quest = z.infer<typeof questSchema>;

export const endingSchema = z.object({ title: line, lines: z.array(line).min(1).max(3) });
export type Ending = z.infer<typeof endingSchema>;
