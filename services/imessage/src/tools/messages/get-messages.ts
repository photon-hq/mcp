import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  chatGuid: z.string().optional().describe("Filter messages by chat GUID"),
  offset: z.number().optional().describe("Number of messages to skip"),
  limit: z.number().optional().describe("Maximum number of messages to return"),
  sort: z.enum(["ASC", "DESC"]).optional().describe("Sort order by date"),
  before: z.number().optional().describe("Only return messages before this timestamp"),
  after: z.number().optional().describe("Only return messages after this timestamp"),
  with: z.array(z.string()).optional().describe("Additional data to include in the response"),
};

export const metadata = {
  name: "getMessages",
  description: "Get messages with optional filters",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.messages.getMessages(args);
  return JSON.stringify(result);
});
