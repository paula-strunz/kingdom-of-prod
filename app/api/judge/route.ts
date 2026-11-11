import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { quests } from "../../../src/content";
import { WHISPER_MAX_LENGTH } from "../../../src/content/schema";
import { judgeAnswer } from "../../../src/judge/judge";
import { createRateLimiter } from "../../../src/judge/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 10;

const bodySchema = z.object({
  questId: z.string(),
  answer: z.string().trim().min(1).max(WHISPER_MAX_LENGTH),
});

const allow = createRateLimiter(10, 60_000);

let client: Anthropic | undefined;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const quest = quests.find((q) => q.id === body.data.questId);
  if (!quest) return Response.json({ error: "unknown_quest" }, { status: 400 });

  try {
    client ??= new Anthropic();
    const tier = await judgeAnswer(client, quest, body.data.answer);
    return Response.json({ tier });
  } catch (error) {
    // Log the failure type only. The player's answer is never logged.
    console.error("judge failed:", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "judge_unavailable" }, { status: 502 });
  }
}
