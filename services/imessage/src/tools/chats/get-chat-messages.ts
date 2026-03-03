import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat"),
  offset: z.number().optional().describe("Number of messages to skip"),
  limit: z.number().optional().describe("Maximum number of messages to return"),
  sort: z.enum(["ASC", "DESC"]).optional().describe("Sort order for messages"),
  before: z.number().optional().describe("Get messages before this timestamp"),
  after: z.number().optional().describe("Get messages after this timestamp"),
  with: z.array(z.string()).optional().describe("Additional data to include in the response"),
};

export const metadata = {
  name: "getChatMessages",
  description: "Get messages for a specific chat",
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
  const options: { offset?: number; limit?: number; sort?: "ASC" | "DESC"; before?: number; after?: number; with?: string[] } = {};
  if (args.offset !== undefined) options.offset = args.offset;
  if (args.limit !== undefined) options.limit = args.limit;
  if (args.sort !== undefined) options.sort = args.sort;
  if (args.before !== undefined) options.before = args.before;
  if (args.after !== undefined) options.after = args.after;
  if (args.with !== undefined) options.with = args.with;
  const result = await sdk.chats.getChatMessages(args.chatGuid, Object.keys(options).length > 0 ? options : undefined);
  return JSON.stringify(result);
}
