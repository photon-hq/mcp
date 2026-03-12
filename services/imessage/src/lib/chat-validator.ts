import type { AdvancedIMessageKit } from "@photon-ai/advanced-imessage-kit";

export class InboundFirstPolicyError extends Error {
  constructor(chatGuid: string) {
    super(
      `Photon's inbound-first policy does not allow sending messages to chats you have not interacted with before (chat GUID: ${chatGuid}). This prevents spam and protects your account from potential bans. Please wait for the recipient to message you first.`
    );
    this.name = "InboundFirstPolicyError";
  }
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  
  const err = error as any;
  if (err.status === 404 || err.statusCode === 404) return true;
  if (err.code === "NOT_FOUND" || err.code === "CHAT_NOT_FOUND") return true;
  if (err.message && typeof err.message === "string") {
    const msg = err.message.toLowerCase();
    if (msg.includes("not found") || msg.includes("does not exist")) return true;
  }
  
  return false;
}

export async function validateChatExists(
  sdk: AdvancedIMessageKit,
  chatGuid: string
): Promise<void> {
  try {
    const chat = await sdk.chats.getChat(chatGuid, { with: ["lastMessage"] });
    
    if (!chat) {
      throw new InboundFirstPolicyError(chatGuid);
    }

    const hasLastMessage = chat.lastMessage !== undefined && chat.lastMessage !== null;
    if (hasLastMessage) {
      const lastMessage = chat.lastMessage as any;
      if (lastMessage.isFromMe === false) {
        return;
      }
    }

    const messages = await sdk.chats.getChatMessages(chatGuid, { limit: 50, sort: "DESC" });
    
    if (!messages || !Array.isArray(messages)) {
      throw new InboundFirstPolicyError(chatGuid);
    }

    const hasInboundMessage = messages.some((msg: any) => msg.isFromMe === false);
    
    if (!hasInboundMessage) {
      throw new InboundFirstPolicyError(chatGuid);
    }
  } catch (error) {
    if (error instanceof InboundFirstPolicyError) {
      throw error;
    }
    
    if (isNotFoundError(error)) {
      throw new InboundFirstPolicyError(chatGuid);
    }
    
    throw error;
  }
}
