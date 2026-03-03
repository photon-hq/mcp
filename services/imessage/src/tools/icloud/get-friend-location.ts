import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  handle: z.string().describe("The handle (phone number or email) of the friend"),
};

export const metadata = {
  name: "getFriendLocation",
  description: "Get the location for a specific friend",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler({ handle }: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.icloud.getLocationForHandle(handle);
  return JSON.stringify(result);
}
