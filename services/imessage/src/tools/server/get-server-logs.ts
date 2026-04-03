import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";
import { withStructuredErrors } from "../../lib/error-handler";

export const schema = {
  count: z.number().optional().describe("Number of log entries to retrieve"),
};

export const metadata = {
  name: "getServerLogs",
  description: "Get recent server logs",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default withStructuredErrors(async (args: InferSchema<typeof schema>) => {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const result = await sdk.server.getServerLogs(args.count);
  return JSON.stringify(result);
});
