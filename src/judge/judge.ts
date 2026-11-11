import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Quest } from "../content/schema";
import type { Tier } from "../engine/types";
import { parseTier, verdictSchema } from "./parse";
import { buildJudgePrompt, JUDGE_MODEL } from "./prompt";

export class JudgeError extends Error {}

/**
 * Grades one whispered answer. Used by the endpoint and by the eval, so the
 * eval tests the shipped code path. Throws rather than return a default tier.
 */
export async function judgeAnswer(
  client: Anthropic,
  quest: Quest,
  answer: string,
  options: { timeoutMs?: number; model?: string } = {},
): Promise<Tier> {
  const { system, user } = buildJudgePrompt(quest, answer);

  const response = await client.messages.parse(
    {
      model: options.model ?? JUDGE_MODEL,
      // Room for the model's brief thinking plus a one-field JSON answer.
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { effort: "low", format: zodOutputFormat(verdictSchema) },
    },
    { timeout: options.timeoutMs ?? 6_000, maxRetries: 0 },
  );

  if (response.stop_reason !== "end_turn") {
    throw new JudgeError(`Judge stopped with ${response.stop_reason}`);
  }
  const tier = parseTier(response.parsed_output);
  if (!tier) throw new JudgeError("Judge did not return a tier");
  return tier;
}
