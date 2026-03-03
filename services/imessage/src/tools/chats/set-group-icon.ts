import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the group chat"),
  filePath: z.string().describe("Path to the image file on the iMessage server"),
};

export const metadata = {
  name: "setGroupIcon",
  description: "Set the group chat icon from a file path on the iMessage server",
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
  await sdk.chats.setGroupIcon(args.chatGuid, args.filePath);
  return "OK";
}
