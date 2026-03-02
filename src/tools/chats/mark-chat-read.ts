import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK, withTimeout } from "../../lib/sdk-pool";

export const schema = {
  guid: z.string().describe("The GUID of the chat to mark as read"),
};

export const metadata = {
  name: "markChatRead",
  description: "Mark a chat as read",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler(args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  await withTimeout(sdk.chats.markChatRead(args.guid), 25_000);
  return "OK";
}
