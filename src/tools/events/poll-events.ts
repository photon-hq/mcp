import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { pollEvents } from "../../lib/sdk-pool";

export const schema = {
  cursor: z.number().optional().describe("Event cursor to poll from. Omit or pass 0 for all buffered events"),
  timeout: z.number().optional().describe("Max seconds to wait for new events (default 15, max 15)"),
};

export const metadata = {
  name: "pollEvents",
  description: "Long-poll for real-time events. Returns buffered events since the given cursor, or waits up to timeout seconds for new ones",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler({ cursor, timeout }: InferSchema<typeof schema>) {
  const h = headers();
  const timeoutMs = Math.min((timeout ?? 15) * 1000, 15000);
  const result = await pollEvents(h["x-server-url"] as string, h["x-api-key"] as string, cursor ?? 0, timeoutMs);
  return JSON.stringify(result);
}
