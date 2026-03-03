import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat containing the poll"),
  pollMessageGuid: z.string().describe("The GUID of the poll message"),
  optionIdentifier: z.string().describe("The identifier of the option to remove the vote from"),
};

export const metadata = {
  name: "unvotePoll",
  description: "Remove a vote from a poll option",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler(args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.polls.unvote({ chatGuid: args.chatGuid, pollMessageGuid: args.pollMessageGuid, optionIdentifier: args.optionIdentifier });
  return JSON.stringify(result);
}
