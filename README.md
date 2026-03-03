# Photon MCP

MCP servers for Photon, deployed at `mcp.photon.codes`.

## Usage

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

## Services

| Service | Endpoint | Port |
|---------|----------|------|
| Gateway | `/*` | 3000 |
| iMessage | `/imessage` | 3001 |

### iMessage

Exposes 67 MCP tools for iMessage — chats, messages, attachments, contacts, polls, scheduled messages, FaceTime, Find My, and more. Built on [`@photon-ai/advanced-imessage-kit`](https://www.npmjs.com/package/@photon-ai/advanced-imessage-kit). Each client authenticates via `x-server-url` and `x-api-key` headers.

## Setup

```bash
pnpm install
pnpm dev
```

Run a single service:

```bash
pnpm dev:imessage
pnpm dev:gateway
```

## Build & Deploy

```bash
pnpm build
docker compose up -d
```

## Structure

```
gateway/              reverse proxy
services/
  imessage/           iMessage MCP (67 tools)
```
