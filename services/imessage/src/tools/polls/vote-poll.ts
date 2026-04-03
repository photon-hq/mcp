import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat containing the poll"),
  pollMessageGuid: z.string().describe("The GUID of the poll message"),
  optionIdentifier: z.string().describe("The identifier of the option to vote for"),
};

export const metadata = {
  name: "votePoll",
  description: "Vote on a poll option",
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
  const result = await sdk.polls.vote({ chatGuid: args.chatGuid, pollMessageGuid: args.pollMessageGuid, optionIdentifier: args.optionIdentifier });
  return JSON.stringify(result);
});
