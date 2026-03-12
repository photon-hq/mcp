import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { validateChatExists } from "../../lib/chat-validator";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat to send the message to"),
  message: z.string().describe("The text content of the message"),
  tempGuid: z.string().optional().describe("Temporary GUID for the message"),
  subject: z.string().optional().describe("Subject line for the message"),
  effectId: z.string().optional().describe("Message effect ID (e.g. com.apple.messages.effect.CKConfettiEffect)"),
  selectedMessageGuid: z.string().optional().describe("GUID of the message being replied to"),
  partIndex: z.number().optional().describe("Part index for multi-part messages"),
  richLink: z.boolean().optional().describe("Whether to include rich link preview"),
};

export const metadata = {
  name: "sendMessage",
  description: "Send a text message to a chat",
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
  
  const result = await sdk.messages.sendMessage(args);
  return JSON.stringify(result);
}
