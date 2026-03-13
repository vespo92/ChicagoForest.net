# @chicago-forest/forest-control-plane - Multi-stage Docker build
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes. Not operational infrastructure.

# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json ./

# Copy relevant packages
COPY packages/shared-types/ packages/shared-types/
COPY packages/firewall/ packages/firewall/
COPY packages/headscale-integration/ packages/headscale-integration/
COPY packages/forest-control-plane/ packages/forest-control-plane/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build dependencies first, then our package
RUN pnpm --filter @chicago-forest/shared-types build && \
    pnpm --filter @chicago-forest/firewall build && \
    pnpm --filter @chicago-forest/headscale-integration build && \
    pnpm --filter @chicago-forest/forest-control-plane build

# Stage 2: Production
FROM node:20-alpine AS production

RUN apk add --no-cache tini

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/packages/forest-control-plane/dist/ ./dist/
COPY --from=builder /app/packages/forest-control-plane/package.json ./

# Copy workspace deps (for node_modules resolution)
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/shared-types/dist/ ./node_modules/@chicago-forest/shared-types/dist/
COPY --from=builder /app/packages/shared-types/package.json ./node_modules/@chicago-forest/shared-types/
COPY --from=builder /app/packages/firewall/dist/ ./node_modules/@chicago-forest/firewall/dist/
COPY --from=builder /app/packages/firewall/package.json ./node_modules/@chicago-forest/firewall/
COPY --from=builder /app/packages/headscale-integration/dist/ ./node_modules/@chicago-forest/headscale-integration/dist/
COPY --from=builder /app/packages/headscale-integration/package.json ./node_modules/@chicago-forest/headscale-integration/

# Create data directory for SQLite
RUN mkdir -p /data && chown -R node:node /data

ENV FOREST_CP_DB_PATH=/data/forest-cp.db
ENV FOREST_CP_PORT=8090
ENV NODE_ENV=production

USER node

EXPOSE 8090

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/index.js"]
