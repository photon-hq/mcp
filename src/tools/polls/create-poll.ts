import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat to create the poll in"),
  question: z.string().describe("The poll question displayed as the title"),
  options: z.array(z.string()).describe("The poll options"),
};

export const metadata = {
  name: "createPoll",
  description: "Create a poll in a chat",
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
  const result = await sdk.polls.create({ chatGuid: args.chatGuid, title: args.question, options: args.options });
  return JSON.stringify(result);
}
