import { z } from "zod";
import { type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";
import { getSDK } from "../../lib/sdk-pool";

export const schema = {
  address: z.string().optional().describe("Filter by address"),
  with: z.array(z.string()).optional().describe("Additional filter criteria"),
  offset: z.number().optional().describe("Number of handles to skip"),
  limit: z.number().optional().describe("Maximum number of handles to return"),
};

export const metadata = {
  name: "queryHandles",
  description: "Query handles with optional filters",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function handler(args: InferSchema<typeof schema>) {
  const h = headers();
  const sdk = await getSDK(h["x-server-url"] as string, h["x-api-key"] as string);
  const options: { address?: string; with?: string[]; offset?: number; limit?: number } = {};
  if (args.address !== undefined) options.address = args.address;
  if (args.with !== undefined) options.with = args.with;
  if (args.offset !== undefined) options.offset = args.offset;
  if (args.limit !== undefined) options.limit = args.limit;
  const result = await sdk.handles.queryHandles(Object.keys(options).length > 0 ? options : undefined);
  return JSON.stringify(result);
}
