import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK, withTimeout } from "../../lib/sdk-pool";

export const schema = {};

export const metadata = {
  name: "createFaceTimeLink",
  description: "Create a FaceTime link",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default async function handler(_args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await withTimeout(sdk.facetime.createFaceTimeLink(), 25_000);
  return JSON.stringify(result);
}
