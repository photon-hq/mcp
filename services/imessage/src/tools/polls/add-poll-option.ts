import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat containing the poll"),
  pollMessageGuid: z.string().describe("The GUID of the poll message"),
  optionText: z.string().describe("The text for the new option"),
};

export const metadata = {
  name: "addPollOption",
  description: "Add a new option to an existing poll",
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
  const result = await sdk.polls.addOption({ chatGuid: args.chatGuid, pollMessageGuid: args.pollMessageGuid, optionText: args.optionText });
  return JSON.stringify(result);
}
