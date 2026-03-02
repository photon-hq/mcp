import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  includeArchived: z.boolean().optional().describe("Include archived chats in the count"),
};

export const metadata = {
  name: "getChatCount",
  description: "Get the total chat count",
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
  const result = await sdk.chats.getChatCount(args.includeArchived !== undefined ? { includeArchived: args.includeArchived } : undefined);
  return JSON.stringify(result);
}
