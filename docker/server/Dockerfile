ARG NODE_VERSION=22.21.1

# Base
FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists

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

# https://turbo.build/repo/docs/guides/tools/docker
RUN turbo prune --scope=@stackframe/backend --scope=@stackframe/dashboard --docker



# Build stage
FROM base AS builder

# copy over package.json files and install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml .
COPY --from=pruner /app/.gitignore .
COPY --from=pruner /app/pnpm-workspace.yaml .
COPY --from=pruner /app/turbo.json .
COPY --from=pruner /app/configs ./configs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store STACK_SKIP_TEMPLATE_GENERATION=true pnpm install --frozen-lockfile

# copy over the rest of the code for the build
COPY --from=pruner /app/out/full/ .

# docs are currently required for the NextJS backend build, but won't exist in the final image
COPY --from=pruner /app/docs ./docs

# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV NEXT_CONFIG_OUTPUT=standalone
ENV NEXT_TELEMETRY_DISABLED=1

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

# Build the backend NextJS app
RUN pnpm turbo run docker-build --filter=@stackframe/backend... --filter=@stackframe/dashboard...

# Build the self-host seed script
RUN cd apps/backend && pnpm build-self-host-migration-script



# Final image
FROM node:${NODE_VERSION}-slim

WORKDIR /app

# Install packages needed for deployment
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y openssl socat && \
    rm -rf /var/lib/apt/lists

# Copy built backend
COPY --from=builder --chown=node:node /app/apps/backend/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/backend/.next/static ./apps/backend/.next/static
COPY --from=builder --chown=node:node /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder --chown=node:node /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=node:node /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy built dashboard
COPY --from=builder --chown=node:node /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=node:node /app/apps/dashboard/public ./apps/dashboard/public

# Restore workspace node_modules needed by non-Next runtime scripts (e.g. migrations)
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages

# Add the entrypoint script
COPY --from=pruner /app/docker/server/entrypoint.sh .
RUN chmod +x entrypoint.sh

WORKDIR /app

# Define environment variables for both services
ENV NODE_ENV=production
ENV BACKEND_PORT=8102
ENV DASHBOARD_PORT=8101

USER node

# Set entrypoint to run both backend and dashboard
ENTRYPOINT ["./entrypoint.sh"]
