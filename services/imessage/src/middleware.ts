import { type Middleware } from "xmcp";
import type { Request, Response, NextFunction } from "express";
import { ERROR_CODES, createErrorData } from "./lib/errors";

function extractJsonRpcId(req: Request): string | number | null {
  try {
    const body = req.body;
    if (body && typeof body === "object" && "id" in body) return body.id;
    if (Array.isArray(body) && body.length > 0 && "id" in body[0]) return body[0].id;
  } catch {}
  return null;
}

const middleware: Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const serverUrl = req.headers["x-server-url"];
  const apiKey = req.headers["x-api-key"];

  if (!serverUrl || !apiKey) {
    const errorCode = !serverUrl && !apiKey
      ? "MISSING_AUTH_HEADERS" as const
      : !serverUrl
        ? "MISSING_SERVER_URL" as const
        : "MISSING_API_KEY" as const;
    const def = ERROR_CODES[errorCode];

    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: def.code,
        message: def.message,
        data: createErrorData(errorCode),
      },
      id: extractJsonRpcId(req),
    });
    return;
  }

  return next();
};

export default middleware;
