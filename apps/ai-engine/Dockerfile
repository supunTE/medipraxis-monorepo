FROM node:22-slim AS base
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# -- Install & build stage --
FROM base AS build
WORKDIR /app

# Copy workspace root files
COPY package.json yarn.lock turbo.json ./

# Copy all package.json files needed for workspace resolution
COPY apps/ai-engine/package.json apps/ai-engine/
COPY apps/api/package.json apps/api/
COPY packages/api-client/package.json packages/api-client/
COPY packages/models/package.json packages/models/
COPY packages/typescript-config/ packages/typescript-config/
COPY packages/eslint-config/package.json packages/eslint-config/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/ai-engine/ apps/ai-engine/
COPY apps/api/src/ apps/api/src/
COPY packages/api-client/ packages/api-client/
COPY packages/models/ packages/models/
COPY packages/eslint-config/ packages/eslint-config/

# Build ai-engine (turbo handles dependency order)
RUN yarn turbo run build --filter=ai-engine

# -- Production stage --
FROM base AS production
WORKDIR /app

# Copy workspace root files for yarn to resolve dependencies
COPY package.json yarn.lock ./
COPY apps/ai-engine/package.json apps/ai-engine/
COPY apps/api/package.json apps/api/
COPY packages/api-client/package.json packages/api-client/
COPY packages/models/package.json packages/models/
COPY packages/eslint-config/package.json packages/eslint-config/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built output and prompts
COPY --from=build /app/apps/ai-engine/dist apps/ai-engine/dist
COPY --from=build /app/apps/ai-engine/prompts apps/ai-engine/prompts

WORKDIR /app/apps/ai-engine

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "dist/index.js"]
