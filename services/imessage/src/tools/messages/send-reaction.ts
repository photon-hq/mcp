import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat containing the message"),
  messageGuid: z.string().describe("The GUID of the message to react to"),
  reaction: z.string().describe("The tapback reaction (e.g. ❤️ 👍 👎 😂 ‼️ ❓)"),
  partIndex: z.number().optional().describe("Part index for multi-part messages"),
};
export const metadata = {
  name: "sendReaction",
  description: "Send a tapback reaction to a message",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default async function handler(args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.messages.sendReaction(args);
  return JSON.stringify(result);
}
