import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { validateChatExists } from "../../lib/chat-validator";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat to send the attachment to"),
  filePath: z.string().describe("Path to the file to attach"),
  fileName: z.string().optional().describe("Display name for the file"),
  isAudioMessage: z.boolean().optional().describe("Whether this is an audio message"),
  selectedMessageGuid: z.string().optional().describe("GUID of the message being replied to"),
};

export const metadata = {
  name: "sendAttachment",
  description: "Send a file attachment to a chat",
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
  
  await validateChatExists(sdk, args.chatGuid);
  
  const result = await sdk.attachments.sendAttachment(args);
  return JSON.stringify(result);
}
