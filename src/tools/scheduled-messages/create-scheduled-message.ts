import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat to send the scheduled message to"),
  message: z.string().describe("The message content"),
  scheduledFor: z.number().describe("Unix timestamp when the message should be sent"),
  type: z.string().optional().describe("The message type"),
};

export const metadata = {
  name: "createScheduledMessage",
  description: "Create a scheduled message",
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
  const options: { chatGuid: string; message: string; scheduledFor: number; type?: string } = {
    chatGuid: args.chatGuid,
    message: args.message,
    scheduledFor: args.scheduledFor,
  };
  if (args.type !== undefined) options.type = args.type;
  const result = await sdk.scheduledMessages.createScheduledMessage(options);
  return JSON.stringify(result);
}
