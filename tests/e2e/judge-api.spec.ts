import { expect, test } from "@playwright/test";

// Input validation only. These requests are rejected before the model is called.
test.describe("POST /api/judge rejects bad input", () => {
  for (const [name, data] of [
    ["an unknown quest", { questId: "nope", answer: "hello" }],
    ["an empty answer", { questId: "lantern-pleas", answer: "   " }],
    ["an answer over 280 characters", { questId: "lantern-pleas", answer: "x".repeat(281) }],
    ["a missing answer", { questId: "lantern-pleas" }],
  ] as const) {
    test(name, async ({ request }) => {
      const response = await request.post("/api/judge", { data });
      expect(response.status()).toBe(400);
    });
  }

  test("a body that is not JSON", async ({ request }) => {
    const response = await request.post("/api/judge", {
      headers: { "content-type": "application/json" },
      data: "not json",
    });
    expect(response.status()).toBe(400);
  });
});
