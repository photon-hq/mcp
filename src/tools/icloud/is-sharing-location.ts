import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  handle: z.string().describe("The handle (phone number or email) to check if sharing location"),
};

export const metadata = {
  name: "isHandleSharingLocation",
  description: "Check if a handle is sharing their location",
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
  const result = await sdk.icloud.isHandleSharingLocation(args.handle);
  return JSON.stringify(result);
}
