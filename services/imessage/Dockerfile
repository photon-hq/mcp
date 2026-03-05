FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY gateway/package.json ./gateway/
COPY services/imessage/package.json ./services/imessage/
RUN pnpm install --frozen-lockfile
COPY services/imessage ./services/imessage
RUN pnpm --filter @photon-mcp/imessage build

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 mcp
COPY --from=build --chown=mcp:nodejs /app/services/imessage/dist ./dist
COPY --from=build --chown=mcp:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=mcp:nodejs /app/services/imessage/node_modules ./services/imessage/node_modules
COPY --from=build --chown=mcp:nodejs /app/services/imessage/package.json ./
ENV NODE_ENV=production
USER mcp
EXPOSE 3001
CMD ["dumb-init", "node", "dist/http.js"]
