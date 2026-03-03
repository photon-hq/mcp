import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  after: z.number().optional().describe("Only count messages after this timestamp"),
  before: z.number().optional().describe("Only count messages before this timestamp"),
  chatGuid: z.string().optional().describe("Filter count by chat GUID"),
  minRowId: z.number().optional().describe("Minimum row ID to include"),
  maxRowId: z.number().optional().describe("Maximum row ID to include"),
};

export const metadata = {
  name: "getUpdatedMessageCount",
  description: "Get the count of updated messages",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler(args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.messages.getUpdatedMessageCount(args);
  return JSON.stringify(result);
}
