import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  guid: z.string().describe("The GUID of the attachment to download"),
  original: z.boolean().optional().describe("Whether to get the original quality"),
  force: z.boolean().optional().describe("Force re-download"),
  height: z.number().optional().describe("Target height for resizing"),
  width: z.number().optional().describe("Target width for resizing"),
  quality: z.number().optional().describe("Quality for resizing"),
};

export const metadata = {
  name: "downloadAttachment",
  description: "Download an attachment as base64 data",
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
  const options: { original?: boolean; force?: boolean; height?: number; width?: number; quality?: number } = {};
  if (args.original !== undefined) options.original = args.original;
  if (args.force !== undefined) options.force = args.force;
  if (args.height !== undefined) options.height = args.height;
  if (args.width !== undefined) options.width = args.width;
  if (args.quality !== undefined) options.quality = args.quality;
  const result = await sdk.attachments.downloadAttachment(args.guid, Object.keys(options).length > 0 ? options : undefined);
  return JSON.stringify({ data: result.toString("base64"), mimeType: "application/octet-stream" });
}
