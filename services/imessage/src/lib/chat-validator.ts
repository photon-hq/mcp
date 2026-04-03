import type { AdvancedIMessageKit } from "@photon-ai/advanced-imessage-kit";
import { type ErrorData, createErrorData } from "./errors";

export class InboundFirstPolicyError extends Error {
  public readonly errorData: ErrorData;

  constructor() {
    super(
      "Inbound-first policy: cannot send to this chat because no inbound message has been received yet. Wait for the recipient to message first."
    );
    this.name = "InboundFirstPolicyError";
    this.errorData = createErrorData("INBOUND_FIRST_POLICY");
  }
}

export class ChatNotFoundError extends Error {
  public readonly errorData: ErrorData;

  constructor() {
    super("The specified chat does not exist.");
    this.name = "ChatNotFoundError";
    this.errorData = createErrorData("CHAT_NOT_FOUND");
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
      throw new ChatNotFoundError();
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
      throw new InboundFirstPolicyError();
    }

    const hasInboundMessage = messages.some((msg: any) => msg.isFromMe === false);
    
    if (!hasInboundMessage) {
      throw new InboundFirstPolicyError();
    }
  } catch (error) {
    if (error instanceof InboundFirstPolicyError || error instanceof ChatNotFoundError) {
      throw error;
    }
    
    if (isNotFoundError(error)) {
      throw new ChatNotFoundError();
    }
    
    throw error;
  }
}
