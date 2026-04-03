import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat"),
  imageUrl: z.string().optional().describe("URL of the background image"),
  filePath: z.string().optional().describe("File path on the iMessage server for the background image"),
  fileData: z.string().optional().describe("Base64 encoded image data for the background"),
};

export const metadata = {
  name: "setBackground",
  description: "Set the chat background image",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async ({ chatGuid, imageUrl, filePath, fileData }: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const options: { imageUrl?: string; filePath?: string; fileData?: string } = {};
  if (imageUrl) options.imageUrl = imageUrl;
  if (filePath) options.filePath = filePath;
  if (fileData) options.fileData = fileData;
  await sdk.chats.setBackground(chatGuid, options);
  return "OK";
});
