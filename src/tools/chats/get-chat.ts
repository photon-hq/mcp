import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  guid: z.string().describe("The GUID of the chat to retrieve"),
  with: z.array(z.string()).optional().describe("Additional data to include in the response"),
};

export const metadata = {
  name: "getChat",
  description: "Get a single chat by GUID",
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
  const result = await sdk.chats.getChat(args.guid, args.with ? { with: args.with } : undefined);
  return JSON.stringify(result);
}
