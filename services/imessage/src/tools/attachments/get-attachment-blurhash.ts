import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  guid: z.string().describe("The GUID of the attachment"),
  height: z.number().optional().describe("Target height for blurhash"),
  width: z.number().optional().describe("Target width for blurhash"),
  quality: z.number().optional().describe("Quality for blurhash"),
};

export const metadata = {
  name: "getAttachmentBlurhash",
  description: "Get the blurhash for an attachment",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const options: { height?: number; width?: number; quality?: number } = {};
  if (args.height !== undefined) options.height = args.height;
  if (args.width !== undefined) options.width = args.width;
  if (args.quality !== undefined) options.quality = args.quality;
  const result = await sdk.attachments.getAttachmentBlurhash(args.guid, Object.keys(options).length > 0 ? options : undefined);
  return JSON.stringify(result);
});
