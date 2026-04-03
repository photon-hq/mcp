import { ToolTimeoutError, BackendUnavailableError } from "./sdk-pool";
import { InboundFirstPolicyError, ChatNotFoundError } from "./chat-validator";
import { McpError, createErrorData, type ErrorData } from "./errors";

export interface StructuredToolError {
  isError: true;
  error_code: string;
  category: string;
  message: string;
  retryable: boolean;
  retry_after?: number;
  suggested_action: string;
  timestamp: string;
  request_id: string;
}

function extractErrorData(error: unknown): ErrorData | null {
  if (error instanceof McpError) return error.errorData;
  if (error instanceof BackendUnavailableError) return error.errorData;
  if (error instanceof ToolTimeoutError) return error.errorData;
  if (error instanceof InboundFirstPolicyError) return error.errorData;
  if (error instanceof ChatNotFoundError) return error.errorData;
  return null;
}

function sanitizeMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Internal error";
  return error.message.replace(/\d{1,3}(\.\d{1,3}){3}(:\d+)?/g, "[redacted]");
}

export function toStructuredError(error: unknown): StructuredToolError {
  const errorData = extractErrorData(error) ?? createErrorData("INTERNAL_ERROR");
  return {
    isError: true,
    error_code: errorData.error_code,
    category: errorData.category,
    message: sanitizeMessage(error),
    retryable: errorData.retryable,
    ...(errorData.retry_after !== undefined ? { retry_after: errorData.retry_after } : {}),
    suggested_action: errorData.suggested_action,
    timestamp: errorData.timestamp,
    request_id: errorData.request_id,
  };
}

/**
 * Wraps a tool handler to catch errors and return structured error responses.
 *
 * xmcp converts thrown errors into `{content: [{type: "text", text: error.message}], isError: true}`
 * which discards all structured data. This wrapper catches errors before xmcp sees them and
 * returns a JSON string with full error metadata that agents can parse deterministically.
 */
export function withStructuredErrors<TArgs>(
  handler: (args: TArgs) => Promise<string>,
): (args: TArgs) => Promise<string> {
  return async (args: TArgs) => {
    try {
      return await handler(args);
    } catch (error) {
      const structured = toStructuredError(error);
      throw new StructuredMcpError(structured);
    }
  };
}

/**
 * Error subclass whose .message is a JSON-serialized StructuredToolError.
 * When xmcp catches this and extracts .message, the agent receives parseable
 * JSON instead of a bare string.
 */
export class StructuredMcpError extends Error {
  constructor(data: StructuredToolError) {
    super(JSON.stringify(data));
    this.name = "StructuredMcpError";
  }
}
