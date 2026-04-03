import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  messageGuid: z.string().describe("The GUID of the message to unsend"),
  partIndex: z.number().optional().describe("Part index for multi-part messages"),
};

export const metadata = {
  name: "unsendMessage",
  description: "Unsend a message",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.messages.unsendMessage(args);
  return JSON.stringify(result);
});
