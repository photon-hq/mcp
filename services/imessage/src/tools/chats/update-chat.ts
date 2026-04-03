import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  guid: z.string().describe("The GUID of the chat to update"),
  displayName: z.string().optional().describe("New display name for the chat"),
};

export const metadata = {
  name: "updateChat",
  description: "Update chat properties like display name",
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
  const options: { displayName?: string } = {};
  if (args.displayName !== undefined) options.displayName = args.displayName;
  const result = await sdk.chats.updateChat(args.guid, options);
  return JSON.stringify(result);
});
