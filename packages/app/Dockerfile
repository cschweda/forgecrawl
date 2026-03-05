FROM node:22-slim AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/app/package.json packages/app/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Build
FROM deps AS build
COPY forgecrawl.config.ts ./
COPY packages/app/ packages/app/
RUN pnpm --filter @forgecrawl/app build

# Production
FROM node:22-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 forgecrawl && \
    useradd --uid 1001 --gid forgecrawl --shell /bin/false --create-home forgecrawl

WORKDIR /app

COPY --from=build /app/packages/app/.output .output/
COPY --from=build /app/forgecrawl.config.ts ./
COPY packages/app/server/db/migrations/ .output/server/db/migrations/

RUN mkdir -p /app/data && chown -R forgecrawl:forgecrawl /app

# Entrypoint to auto-generate auth secret
COPY packages/app/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER forgecrawl

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
