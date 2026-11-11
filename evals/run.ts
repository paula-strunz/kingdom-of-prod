/**
 * Runs the judge over the hand-labelled answers and reports agreement.
 *
 *   npm run eval            run, and record the run in Arize Phoenix
 *   npm run eval -- --local run without Phoenix
 *
 * Calls the model once per answer, so each run costs a little money.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { quests } from "../src/content";
import { TIERS, type Tier } from "../src/engine/types";
import { judgeAnswer } from "../src/judge/judge";
import { JUDGE_MODEL, PROMPT_VERSION } from "../src/judge/prompt";
import { loadLabels, type LabelledAnswer } from "./labels";

const PASS_AT = 0.8;
const here = path.dirname(fileURLToPath(import.meta.url));
const local = process.argv.includes("--local");

type Result = LabelledAnswer & { judged: Tier | "error" };

async function main() {
  const labels = loadLabels(path.join(here, "labels.jsonl"));
  if (!local && !process.env.PHOENIX_ENDPOINT) {
    throw new Error("Set PHOENIX_ENDPOINT (and PHOENIX_API_KEY), or pass --local to skip Phoenix.");
  }

  const client = new Anthropic();
  const results: Result[] = [];
  for (const row of labels) {
    const quest = quests.find((q) => q.id === row.questId)!;
    const judged = await judgeAnswer(client, quest, row.answer, { timeoutMs: 30_000 }).catch(
      (error: unknown) => {
        console.error(`judge failed on "${row.answer}":`, error);
        return "error" as const;
      },
    );
    results.push({ ...row, judged });
  }

  const agreed = results.filter((r) => r.judged === r.label).length;
  const agreement = agreed / results.length;

  console.log(`\nModel ${JUDGE_MODEL}, prompt ${PROMPT_VERSION}`);
  console.log(`Agreement: ${agreed} of ${results.length} (${Math.round(agreement * 100)}%)\n`);

  console.log("Rows are Paula's label, columns are the judge's tier:");
  console.table(
    Object.fromEntries(
      TIERS.map((label) => [
        label,
        Object.fromEntries(
          [...TIERS, "error" as const].map((judged) => [
            judged,
            results.filter((r) => r.label === label && r.judged === judged).length,
          ]),
        ),
      ]),
    ),
  );

  const misses = results.filter((r) => r.judged !== r.label);
  if (misses.length) {
    console.log("Disagreements:");
    for (const r of misses) {
      console.log(`- [${r.questId}] "${r.answer}"\n    label: ${r.label}, judge: ${r.judged}`);
    }
  }

  if (!local) await recordInPhoenix(results, agreement);

  const passed = agreement >= PASS_AT;
  console.log(passed ? "\nPASS" : `\nFAIL: under ${PASS_AT * 100}%`);
  process.exit(passed ? 0 : 1);
}

/** Records the answers as a dataset and this run as an experiment, using the tiers already judged. */
async function recordInPhoenix(results: Result[], agreement: number) {
  const { createDataset } = await import("@arizeai/phoenix-client/datasets");
  const { asExperimentEvaluator, runExperiment } = await import(
    "@arizeai/phoenix-client/experiments"
  );

  const key = (questId: unknown, answer: unknown) => `${String(questId)}|${String(answer)}`;
  const judged = new Map(results.map((r) => [key(r.questId, r.answer), r.judged]));

  const { datasetId } = await createDataset({
    name: "kingdom-of-prod-judge-v0",
    description: "Whispered answers with Paula's hand labels, four per quest.",
    examples: results.map((r) => ({
      input: { questId: r.questId, answer: r.answer },
      output: { tier: r.label },
      metadata: {},
    })),
  });

  const experiment = await runExperiment({
    dataset: { datasetId },
    experimentName: `judge ${PROMPT_VERSION} ${JUDGE_MODEL} ${new Date().toISOString()}`,
    experimentMetadata: { model: JUDGE_MODEL, promptVersion: PROMPT_VERSION, agreement },
    task: async (example) =>
      judged.get(key(example.input.questId, example.input.answer)) ?? "error",
    evaluators: [
      asExperimentEvaluator({
        name: "agrees-with-label",
        kind: "CODE",
        evaluate: async ({ output, expected }) => {
          const agrees = output === expected?.tier;
          return {
            label: agrees ? "agree" : "disagree",
            score: agrees ? 1 : 0,
            explanation: `judge: ${String(output)}, label: ${String(expected?.tier)}`,
            metadata: {},
          };
        },
      }),
    ],
  });
  console.log(`\nRecorded in Phoenix as experiment ${experiment.id}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(2);
});
