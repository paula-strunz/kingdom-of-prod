import { readFileSync } from "node:fs";
import { z } from "zod";
import { quests } from "../src/content";
import { WHISPER_MAX_LENGTH } from "../src/content/schema";
import { TIERS } from "../src/engine/types";

export const PER_QUEST = 4;

const rowSchema = z.object({
  questId: z.string(),
  answer: z.string().trim().min(1).max(WHISPER_MAX_LENGTH),
  label: z.enum(TIERS),
});
export type LabelledAnswer = z.infer<typeof rowSchema>;

/** Reads the hand-labelled set and checks it is the shape the spec asks for. */
export function loadLabels(path: string): LabelledAnswer[] {
  const rows = readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line, i) => {
      const row = rowSchema.safeParse(JSON.parse(line));
      if (!row.success) throw new Error(`${path} line ${i + 1}: ${z.prettifyError(row.error)}`);
      return row.data;
    });

  const problems: string[] = [];
  for (const quest of quests) {
    const count = rows.filter((r) => r.questId === quest.id).length;
    if (count !== PER_QUEST) problems.push(`${quest.id} has ${count} answers, needs ${PER_QUEST}`);
    const examples = Object.values(quest.rubric.examples).flat();
    for (const row of rows) {
      if (row.questId === quest.id && examples.includes(row.answer)) {
        problems.push(`"${row.answer}" is also a rubric example`);
      }
    }
  }
  const known = new Set(quests.map((q) => q.id));
  for (const row of rows) if (!known.has(row.questId)) problems.push(`unknown quest ${row.questId}`);
  if (new Set(rows.map((r) => `${r.questId}|${r.answer}`)).size !== rows.length) {
    problems.push("the set has duplicate answers");
  }
  if (problems.length) throw new Error(`${path} is not ready:\n- ${problems.join("\n- ")}`);
  return rows;
}
