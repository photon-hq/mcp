import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  guid: z.string().describe("The GUID of the live photo attachment to download"),
};

export const metadata = {
  name: "downloadAttachmentLive",
  description: "Download a live photo attachment as base64 data",
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
  const result = await sdk.attachments.downloadAttachmentLive(args.guid);
  return JSON.stringify({ data: result.toString("base64"), mimeType: "application/octet-stream" });
}
