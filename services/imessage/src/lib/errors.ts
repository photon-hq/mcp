import { randomBytes } from "node:crypto";

export type ErrorCategory =
  | "auth"
  | "backend"
  | "timeout"
  | "policy"
  | "validation"
  | "not_found"
  | "rate_limit"
  | "internal";

export interface ErrorData {
  error_code: string;
  category: ErrorCategory;
  status: number;
  retryable: boolean;
  retry_after?: number;
  suggested_action: string;
  timestamp: string;
  request_id: string;
}

export const ERROR_CODES = {
  MISSING_AUTH_HEADERS: {
    code: -32001,
    status: 401,
    category: "auth" as const,
    retryable: false,
    message: "Missing authentication headers",
    suggested_action:
      "Check that both x-server-url and x-api-key headers are present in the request.",
  },
  MISSING_SERVER_URL: {
    code: -32001,
    status: 401,
    category: "auth" as const,
    retryable: false,
    message: "Missing x-server-url header",
    suggested_action:
      "Add the x-server-url header pointing to your iMessage backend URL.",
  },
  MISSING_API_KEY: {
    code: -32001,
    status: 401,
    category: "auth" as const,
    retryable: false,
    message: "Missing x-api-key header",
    suggested_action: "Add the x-api-key header with your backend API key.",
  },
  BACKEND_UNAVAILABLE: {
    code: -32000,
    status: 502,
    category: "backend" as const,
    retryable: true,
    retry_after: 5,
    message: "iMessage backend unavailable",
    suggested_action:
      "The iMessage backend is temporarily unreachable. Wait 5 seconds and retry. If this persists after 3 attempts, verify your x-server-url points to a running backend.",
  },
  BACKEND_CONNECTION_FAILED: {
    code: -32000,
    status: 502,
    category: "backend" as const,
    retryable: true,
    retry_after: 5,
    message: "Failed to connect to iMessage backend",
    suggested_action:
      "Failed to establish connection to the iMessage backend. Retry in 5 seconds. If the backend is freshly started, it may need up to 15 seconds to become ready.",
  },
  TOOL_TIMEOUT: {
    code: -32002,
    status: 504,
    category: "timeout" as const,
    retryable: true,
    retry_after: 3,
    message: "Tool execution timed out",
    suggested_action:
      "The operation timed out after 30 seconds. Retry once — if the backend was under load, it may succeed. If the tool takes input that controls scope (e.g. message count), try reducing it.",
  },
  CONNECT_TIMEOUT: {
    code: -32002,
    status: 504,
    category: "timeout" as const,
    retryable: true,
    retry_after: 10,
    message: "Backend connection timed out",
    suggested_action:
      "Backend connection timed out after 15 seconds. The backend may be starting up. Wait 10 seconds and retry.",
  },
  INBOUND_FIRST_POLICY: {
    code: -32003,
    status: 403,
    category: "policy" as const,
    retryable: false,
    message: "Inbound-first policy violation",
    suggested_action:
      "Cannot send to this chat — no inbound message has been received. Wait for the recipient to message first, then retry. This is an anti-spam policy and cannot be bypassed.",
  },
  CHAT_NOT_FOUND: {
    code: -32004,
    status: 404,
    category: "not_found" as const,
    retryable: false,
    message: "Chat not found",
    suggested_action:
      "The specified chat GUID does not exist. Verify the chat GUID by listing chats first, then retry with a valid GUID.",
  },
  SERVICE_UNAVAILABLE: {
    code: -32000,
    status: 502,
    category: "backend" as const,
    retryable: true,
    retry_after: 5,
    message: "Service unavailable",
    suggested_action:
      "The upstream service is unavailable. Retry in 5 seconds with exponential backoff.",
  },
  INTERNAL_ERROR: {
    code: -32603,
    status: 500,
    category: "internal" as const,
    retryable: false,
    message: "Internal error",
    suggested_action:
      "An unexpected error occurred. This may be a bug — do not retry with the same parameters.",
  },
  VALIDATION_ERROR: {
    code: -32602,
    status: 400,
    category: "validation" as const,
    retryable: false,
    message: "Invalid parameters",
    suggested_action:
      "The provided parameters are invalid. Check the tool's schema for required fields and correct types.",
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function generateRequestId(): string {
  return randomBytes(8).toString("hex");
}

export function createErrorData(
  errorCode: ErrorCode,
  overrides?: Partial<Pick<ErrorData, "retry_after" | "suggested_action">>,
): ErrorData {
  const def = ERROR_CODES[errorCode];
  const retryAfter = def.retryable
    ? overrides?.retry_after ?? ("retry_after" in def ? def.retry_after : undefined)
    : undefined;
  return {
    error_code: errorCode,
    category: def.category,
    status: def.status,
    retryable: def.retryable,
    ...(retryAfter !== undefined ? { retry_after: retryAfter } : {}),
    suggested_action: overrides?.suggested_action ?? def.suggested_action,
    timestamp: new Date().toISOString(),
    request_id: generateRequestId(),
  };
}

export class McpError extends Error {
  public readonly errorData: ErrorData;

  constructor(errorCode: ErrorCode, message?: string, overrides?: Partial<Pick<ErrorData, "retry_after" | "suggested_action">>) {
    const def = ERROR_CODES[errorCode];
    super(message ?? def.message);
    this.name = "McpError";
    this.errorData = createErrorData(errorCode, overrides);
  }
}
