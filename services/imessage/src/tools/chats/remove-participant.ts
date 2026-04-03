import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  chatGuid: z.string().describe("The GUID of the group chat"),
  address: z.string().describe("The address (phone or email) of the participant to remove"),
};

export const metadata = {
  name: "removeParticipant",
  description: "Remove a participant from a group chat",
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
  const result = await sdk.chats.removeParticipant(args.chatGuid, args.address);
  return JSON.stringify(result);
});
