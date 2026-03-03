# Photon MCP Monorepo

Multi-service MCP server monorepo deployed at `mcp.photon.codes`. Each MCP service runs independently and is routed through a shared gateway.

## Services

| Service | Path | Port | Description |
|---------|------|------|-------------|
| **Gateway** | `mcp.photon.codes/*` | 3000 | Reverse proxy routing to MCP services |
| **iMessage** | `mcp.photon.codes/imessage` | 3001 | iMessage SDK via `@photon-ai/advanced-imessage-kit` |

## Quick Start

```bash
pnpm install
pnpm dev
```

## Client Configuration

### iMessage

```json
{
  "mcpServers": {
    "photon-imessage": {
      "url": "https://mcp.photon.codes/imessage",
      "headers": {
        "x-server-url": "https://your-endpoint-here",
        "x-api-key": "your-api-key-here"
      }
    }
  }
}
```

## Structure

```
mcp/
  gateway/          Reverse proxy gateway
  services/
    imessage/       iMessage MCP server (67 tools)
```

## Adding a New MCP Service

1. Create `services/<name>/` with `package.json`, `xmcp.config.ts`, `Dockerfile`, and `src/tools/`
2. Set the endpoint to `/<name>` and pick a unique port
3. Add `ROUTE_<NAME>: "http://<name>:<port>"` to the gateway environment in `docker-compose.yml`
4. Add the service block to `docker-compose.yml`

## Deployment

Deployed on Dokploy via Docker Compose. The gateway receives all traffic at `mcp.photon.codes` and proxies to internal service containers.

```bash
pnpm build
docker compose up -d
```
