import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK, withTimeout, ToolTimeoutError } from "../../lib/sdk-pool";

const AVAILABILITY_TIMEOUT_MS = 10_000;

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
  try {
    const result = await withTimeout(
      sdk.handles.getHandleAvailability(args.address, args.type),
      AVAILABILITY_TIMEOUT_MS,
    );
    return JSON.stringify(result);
  } catch (err) {
    if (err instanceof ToolTimeoutError) {
      return JSON.stringify({ available: false, timedOut: true, address: args.address, type: args.type });
    }
    throw err;
  }
}
