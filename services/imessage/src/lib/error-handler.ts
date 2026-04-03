import { ToolTimeoutError, BackendUnavailableError } from "./sdk-pool";
import { InboundFirstPolicyError, ChatNotFoundError } from "./chat-validator";
import { McpError, createErrorData, type ErrorData } from "./errors";

export interface StructuredToolError {
  code: number;
  message: string;
  data: ErrorData;
}

function extractErrorData(error: unknown): ErrorData | null {
  if (error instanceof McpError) return error.errorData;
  if (error instanceof BackendUnavailableError) return error.errorData;
  if (error instanceof ToolTimeoutError) return error.errorData;
  if (error instanceof InboundFirstPolicyError) return error.errorData;
  if (error instanceof ChatNotFoundError) return error.errorData;
  return null;
}

function extractJsonRpcCode(error: unknown): number {
  if (error instanceof ToolTimeoutError) return -32002;
  if (error instanceof BackendUnavailableError) return -32000;
  if (error instanceof InboundFirstPolicyError) return -32003;
  if (error instanceof ChatNotFoundError) return -32004;
  if (error instanceof McpError) return error.errorData.status;
  return -32603;
}

function sanitizeMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Internal error";
  const msg = error.message;
  return msg.replace(/\d{1,3}(\.\d{1,3}){3}(:\d+)?/g, "[redacted]");
}

export function toStructuredError(error: unknown): StructuredToolError {
  const errorData = extractErrorData(error);

  if (errorData) {
    return {
      code: extractJsonRpcCode(error),
      message: sanitizeMessage(error),
      data: errorData,
    };
  }

  return {
    code: -32603,
    message: sanitizeMessage(error),
    data: createErrorData("INTERNAL_ERROR"),
  };
}
