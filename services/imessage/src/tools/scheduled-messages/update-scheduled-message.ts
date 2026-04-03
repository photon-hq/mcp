import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  id: z.string().describe("The ID of the scheduled message to update"),
  message: z.string().optional().describe("The updated message content"),
  scheduledFor: z.number().optional().describe("The updated unix timestamp when the message should be sent"),
};

export const metadata = {
  name: "updateScheduledMessage",
  description: "Update a scheduled message",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const options: { message?: string; scheduledFor?: number } = {};
  if (args.message !== undefined) options.message = args.message;
  if (args.scheduledFor !== undefined) options.scheduledFor = args.scheduledFor;
  const result = await sdk.scheduledMessages.updateScheduledMessage(args.id, options);
  return JSON.stringify(result);
});
