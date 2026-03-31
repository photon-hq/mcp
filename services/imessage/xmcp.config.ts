import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  bundler: (rspackConfig) => {
    rspackConfig.ignoreWarnings = [
      /Can't resolve 'supports-color'/,
      /Can't resolve 'bufferutil'/,
      /Can't resolve 'utf-8-validate'/,
    ];
    return rspackConfig;
  },
  paths: {
    tools: "src/tools",
    prompts: false,
    resources: false,
  },
  http: {
    port: 3001,
    host: "0.0.0.0",
    endpoint: "/imessage",
    cors: {
      origin: process.env.CORS_ORIGIN || "https://mcp.photon.codes",
      methods: ["GET", "POST"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "mcp-session-id",
        "mcp-protocol-version",
        "x-server-url",
        "x-api-key",
      ],
      exposedHeaders: ["Content-Type", "Authorization", "mcp-session-id"],
      credentials: false,
      maxAge: 86400,
    },
  },
};

export default config;
