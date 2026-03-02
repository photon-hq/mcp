import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  only: z.array(z.string()).optional().describe("Filter to only include specific media types"),
  byChat: z.boolean().optional().describe("If true, return statistics grouped by chat"),
};

export const metadata = {
  name: "getMediaStats",
  description: "Get media statistics, optionally grouped by chat",
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
  const options = args.only !== undefined ? { only: args.only } : undefined;
  const result = args.byChat
    ? await sdk.server.getMediaStatisticsByChat(options)
    : await sdk.server.getMediaStatistics(options);
  return JSON.stringify(result);
}
