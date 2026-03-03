import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  messageGuid: z.string().describe("The GUID of the message to edit"),
  editedMessage: z.string().describe("The new text content for the message"),
  backwardsCompatibilityMessage: z.string().optional().describe("Fallback message for older clients"),
  partIndex: z.number().optional().describe("Part index for multi-part messages"),
};

export const metadata = {
  name: "editMessage",
  description: "Edit a sent message",
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
  const result = await sdk.messages.editMessage(args);
  return JSON.stringify(result);
}
