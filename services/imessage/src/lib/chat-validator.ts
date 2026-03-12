import type { AdvancedIMessageKit } from "@photon-ai/advanced-imessage-kit";

export class InboundFirstPolicyError extends Error {
  constructor(chatGuid: string) {
    super(
      `Photon's inbound-first policy does not allow sending messages to chats you have not interacted with before (chat GUID: ${chatGuid}). This prevents spam and protects your account from potential bans. Please wait for the recipient to message you first.`
    );
    this.name = "InboundFirstPolicyError";
  }
}

export async function validateChatExists(
  sdk: AdvancedIMessageKit,
  chatGuid: string
): Promise<void> {
  try {
    const chat = await sdk.chats.getChat(chatGuid);
    
    if (!chat) {
      throw new InboundFirstPolicyError(chatGuid);
    }
  } catch (error) {
    if (error instanceof InboundFirstPolicyError) {
      throw error;
    }
    throw new InboundFirstPolicyError(chatGuid);
  }
}
