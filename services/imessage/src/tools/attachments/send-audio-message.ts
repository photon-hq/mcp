import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { validateChatExists } from "../../lib/chat-validator";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  chatGuid: z.string().describe("The GUID of the chat to send the audio message to"),
  filePath: z.string().describe("Path to the audio file"),
  fileName: z.string().optional().describe("Display name for the audio file"),
};

export const metadata = {
  name: "sendAudioMessage",
  description: "Send an audio message to a chat",
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

  const result = await sdk.attachments.sendAttachment({
    chatGuid: args.chatGuid,
    filePath: args.filePath,
    fileName: args.fileName,
    isAudioMessage: true,
  });
  return JSON.stringify(result);
});
