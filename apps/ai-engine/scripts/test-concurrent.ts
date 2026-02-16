/**
 * Concurrent test script for verifying AsyncLocalStorage thread safety.
 *
 * Sends 5 requests in parallel, each with a different userId.
 * Check the ai-engine logs to verify each tool call uses the correct userId.
 *
 * Usage: npx tsx apps/ai-engine/scripts/test-concurrent.ts
 */

const API_URL = "http://localhost:8000/api/ai/query";
const API_KEY = process.env.AI_ENGINE_API_KEY || "";

async function sendQuery(userId: string) {
  const start = Date.now();
  console.log(`[${userId}] Sending request...`);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      query: "Show me my appointments for today",
      userId,
    }),
  });

  const data = await res.json();
  const elapsed = Date.now() - start;
  console.log(
    `[${userId}] Response (${elapsed}ms):`,
    JSON.stringify(data, null, 2)
  );
  return { userId, data };
}

async function main() {
  if (!API_KEY) {
    console.error("Set AI_ENGINE_API_KEY env variable first");
    process.exit(1);
  }

  console.log("Sending 5 concurrent requests with different userIds...\n");

  const userIds = ["user-001", "user-002", "user-003", "user-004", "user-005"];
  const results = await Promise.all(userIds.map((id) => sendQuery(id)));

  console.log("\n=== SUMMARY ===");
  for (const { userId, data } of results) {
    const message = data?.data?.message ?? "NO MESSAGE";
    const hasCorrectId = message.includes(userId);
    console.log(
      `[${userId}] Contains own userId in response: ${hasCorrectId ? "YES" : "NO - POSSIBLE LEAK"}`
    );
  }
}

main().catch(console.error);
