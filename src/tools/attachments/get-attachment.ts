import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  guid: z.string().describe("The GUID of the attachment"),
};

export const metadata = {
  name: "getAttachment",
  description: "Get attachment metadata by GUID",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler(args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.attachments.getAttachment(args.guid);
  return JSON.stringify(result);
}
