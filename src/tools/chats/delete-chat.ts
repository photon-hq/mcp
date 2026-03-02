import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  guid: z.string().describe("The GUID of the chat to delete"),
};

export const metadata = {
  name: "deleteChat",
  description: "Delete a chat by GUID",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler({ guid }: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  await sdk.chats.deleteChat(guid);
  return "OK";
}
