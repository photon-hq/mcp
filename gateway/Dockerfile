FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm build

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 gateway
COPY --from=build --chown=gateway:nodejs /app/dist ./dist
COPY --from=build --chown=gateway:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=gateway:nodejs /app/package.json ./
ENV NODE_ENV=production
USER gateway
EXPOSE 3000
CMD ["dumb-init", "node", "dist/index.js"]
