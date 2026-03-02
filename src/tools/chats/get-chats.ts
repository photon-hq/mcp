import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  withLastMessage: z.boolean().optional().describe("Include the last message in each chat"),
  withArchived: z.boolean().optional().describe("Include archived chats"),
  offset: z.number().optional().describe("Number of chats to skip"),
  limit: z.number().optional().describe("Maximum number of chats to return"),
  sort: z.string().optional().describe("Sort order for chats"),
};

export const metadata = {
  name: "getChats",
  description: "List all chats with optional filters",
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
  const options: { withLastMessage?: boolean; withArchived?: boolean; offset?: number; limit?: number; sort?: string } = {};
  if (args.withLastMessage !== undefined) options.withLastMessage = args.withLastMessage;
  if (args.withArchived !== undefined) options.withArchived = args.withArchived;
  if (args.offset !== undefined) options.offset = args.offset;
  if (args.limit !== undefined) options.limit = args.limit;
  if (args.sort !== undefined) options.sort = args.sort;
  const result = await sdk.chats.getChats(Object.keys(options).length > 0 ? options : undefined);
  return JSON.stringify(result);
}
