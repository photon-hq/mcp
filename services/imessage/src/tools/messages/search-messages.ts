import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  query: z.string().describe("The search query text"),
  chatGuid: z.string().optional().describe("Filter search results by chat GUID"),
  offset: z.number().optional().describe("Number of results to skip"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  sort: z.enum(["ASC", "DESC"]).optional().describe("Sort order by date"),
  before: z.number().optional().describe("Only return messages before this timestamp"),
  after: z.number().optional().describe("Only return messages after this timestamp"),
};

export const metadata = {
  name: "searchMessages",
  description: "Search messages by text query",
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
  const result = await sdk.messages.searchMessages(args);
  return JSON.stringify(result);
});
