# Backend for Cloud Run / self-hosted deployment (fallback backend server).
# Connects to the same AWS services (RDS, S3, KMS) as the Vercel deployment.
#
# Build:  docker build -t stack-backend .
# Run:    docker run -p 8102:8102 --env-file .env stack-backend

ARG NODE_VERSION=22.21.1

# Base
FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
RUN corepack prepare pnpm@10.23.0 --activate
RUN pnpm add -g turbo
RUN pnpm add -g tsx


# Prune stage
FROM base AS pruner

COPY . .

RUN tsx ./scripts/generate-sdks.ts

# Only prune backend (no dashboard)
RUN turbo prune --scope=@stackframe/backend --docker


# Build stage
FROM base AS builder

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
COPY --from=pruner /app/.gitignore .
COPY --from=pruner /app/pnpm-workspace.yaml .
COPY --from=pruner /app/turbo.json .
COPY --from=pruner /app/configs ./configs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store STACK_SKIP_TEMPLATE_GENERATION=true pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Docs are required for the NextJS backend build
COPY --from=pruner /app/docs ./docs

ENV NEXT_CONFIG_OUTPUT=standalone

# Add build-time environment variables. 
# For server-only variables, we use valid dummy values (Node.js will read real values at runtime).
# For client-side variables (NEXT_PUBLIC_), we use sentinels for runtime injection into the JS bundles.
ENV STACK_DATABASE_CONNECTION_STRING=postgres://localhost:5432/dummy
ENV STACK_SERVER_SECRET=build-time-dummy-secret-key-at-least-32-chars
ENV STACK_SEED_INTERNAL_PROJECT_PUBLISHABLE_CLIENT_KEY=STACK_ENV_VAR_SENTINEL_STACK_SEED_INTERNAL_PROJECT_PUBLISHABLE_CLIENT_KEY
ENV STACK_SEED_INTERNAL_PROJECT_SECRET_SERVER_KEY=STACK_ENV_VAR_SENTINEL_STACK_SEED_INTERNAL_PROJECT_SECRET_SERVER_KEY
ENV NEXT_PUBLIC_STACK_API_URL=STACK_ENV_VAR_SENTINEL_NEXT_PUBLIC_STACK_API_URL
ENV NEXT_PUBLIC_STACK_DASHBOARD_URL=STACK_ENV_VAR_SENTINEL_NEXT_PUBLIC_STACK_DASHBOARD_URL
ENV NEXT_PUBLIC_STACK_PORT_PREFIX=STACK_ENV_VAR_SENTINEL_NEXT_PUBLIC_STACK_PORT_PREFIX
ENV STACK_ENV_VAR_SENTINEL_USE_INLINE_ENV_VARS=STACK_ENV_VAR_SENTINEL_USE_INLINE_ENV_VARS

# Build backend only
RUN pnpm turbo run docker-build --filter=@stackframe/backend...

# Build the self-host seed/migration script
RUN cd apps/backend && pnpm build-self-host-migration-script


# Final image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy Next.js standalone output — this includes a traced, minimal copy of
# node_modules/ and packages/ (only the files the server actually imports).
COPY --from=builder --chown=node:node /app/apps/backend/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/backend/.next/static ./apps/backend/.next/static

# Prisma schema (needed at runtime by Prisma client)
COPY --from=builder --chown=node:node /app/apps/backend/prisma ./apps/backend/prisma

# Copy built backend migration scripts and dependencies
COPY --from=builder --chown=node:node /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=node:node /app/apps/backend/node_modules ./apps/backend/node_modules

# Restore workspace node_modules needed by non-Next runtime scripts (e.g. migrations)
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages

# Copy the entrypoint script
COPY --from=pruner /app/docker/backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8102
ENV HOSTNAME=0.0.0.0

USER node

EXPOSE 8102

ENTRYPOINT ["./entrypoint.sh"]
