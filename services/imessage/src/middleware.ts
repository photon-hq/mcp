import { type Middleware } from "xmcp";
import type { Request, Response, NextFunction } from "express";

const middleware: Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const serverUrl = req.headers["x-server-url"];
  const apiKey = req.headers["x-api-key"];

  if (!serverUrl || !apiKey) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Missing x-server-url or x-api-key header",
      },
      id: null,
    });
    return;
  }

  return next();
};

export default middleware;
