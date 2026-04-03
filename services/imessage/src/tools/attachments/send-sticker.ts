import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { validateChatExists } from "../../lib/chat-validator";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat to send the sticker to"),
  filePath: z.string().describe("Path to the sticker file"),
  fileName: z.string().optional().describe("Display name for the sticker"),
  selectedMessageGuid: z.string().optional().describe("GUID of the message being replied to"),
  stickerX: z.number().optional().describe("X position of the sticker"),
  stickerY: z.number().optional().describe("Y position of the sticker"),
  stickerScale: z.number().optional().describe("Scale of the sticker"),
  stickerRotation: z.number().optional().describe("Rotation of the sticker in degrees"),
  stickerWidth: z.number().optional().describe("Width of the sticker"),
};

export const metadata = {
  name: "sendSticker",
  description: "Send a sticker to a chat",
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);

  await validateChatExists(sdk, args.chatGuid);

  const result = await sdk.attachments.sendSticker(args);
  return JSON.stringify(result);
});
