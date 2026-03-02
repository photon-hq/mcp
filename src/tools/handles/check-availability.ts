import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  address: z.string().describe("The address (email or phone) to check"),
  type: z.enum(["imessage", "facetime"]).describe("The service type to check availability for"),
};

export const metadata = {
  name: "checkAvailability",
  description: "Check if an address is available on iMessage or FaceTime",
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
  const result = await sdk.handles.getHandleAvailability(args.address, args.type);
  return JSON.stringify(result);
}
