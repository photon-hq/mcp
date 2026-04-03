import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  addresses: z.array(z.string()).describe("Participant addresses (phone numbers or email)"),
  method: z.enum(["apple-script", "private-api"]).optional().describe("Method used to create the chat"),
  service: z.enum(["iMessage", "SMS"]).optional().describe("Message service to use"),
  tempGuid: z.string().optional().describe("Temporary GUID for the chat"),
};

export const metadata = {
  name: "createChat",
  description: "Create a new chat with one or more participants. Note: Due to inbound-first policy, you cannot send an initial message when creating a chat. Create the chat first, then wait for the recipient to send a message before you can reply.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const options: { addresses: string[]; method?: "apple-script" | "private-api"; service?: "iMessage" | "SMS"; tempGuid?: string } = { addresses: args.addresses };
  if (args.method !== undefined) options.method = args.method;
  if (args.service !== undefined) options.service = args.service;
  if (args.tempGuid !== undefined) options.tempGuid = args.tempGuid;
  const result = await sdk.chats.createChat(options);
  return JSON.stringify(result);
});
