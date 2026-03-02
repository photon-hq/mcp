# Photon iMessage MCP Server

Multi-tenant MCP server exposing the complete `@photon-ai/advanced-imessage-kit` SDK as **67 MCP tools** over Streamable HTTP via [xmcp](https://xmcp.dev). Deployed at `https://mcp.photon.codes/mcp` on Dokploy.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Client Configuration

```json
{
  "mcpServers": {
    "photon-imessage": {
      "url": "https://mcp.photon.codes/mcp",
      "headers": {
        "x-server-url": "http://your-imessage-server:1234",
        "x-api-key": "your-api-key"
      }
    }
  }
}
```

## Architecture

Each MCP client sends its own iMessage server URL and API key in headers. The MCP server is a stateless proxy with an in-memory SDK connection pool.

## Deployment

Deployed on Dokploy via Docker Compose. Domain `mcp.photon.codes` routes through Traefik to the container on port 3001.

```bash
pnpm build
docker compose up -d
```
