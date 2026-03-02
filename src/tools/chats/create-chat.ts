import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  addresses: z.array(z.string()).describe("Participant addresses (phone numbers or email)"),
  message: z.string().optional().describe("Initial message to send in the chat"),
  method: z.enum(["apple-script", "private-api"]).optional().describe("Method used to create the chat"),
  service: z.enum(["iMessage", "SMS"]).optional().describe("Message service to use"),
  tempGuid: z.string().optional().describe("Temporary GUID for the chat"),
  subject: z.string().optional().describe("Subject line for the chat"),
  effectId: z.string().optional().describe("Message effect ID"),
};

export const metadata = {
  name: "createChat",
  description: "Create a new chat with one or more participants",
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
  const options: { addresses: string[]; message?: string; method?: "apple-script" | "private-api"; service?: "iMessage" | "SMS"; tempGuid?: string; subject?: string; effectId?: string } = { addresses: args.addresses };
  if (args.message !== undefined) options.message = args.message;
  if (args.method !== undefined) options.method = args.method;
  if (args.service !== undefined) options.service = args.service;
  if (args.tempGuid !== undefined) options.tempGuid = args.tempGuid;
  if (args.subject !== undefined) options.subject = args.subject;
  if (args.effectId !== undefined) options.effectId = args.effectId;
  const result = await sdk.chats.createChat(options);
  return JSON.stringify(result);
}
