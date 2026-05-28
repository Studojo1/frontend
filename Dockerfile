# Bun-based build and runtime. Uses Debian (glibc) to avoid rollup optional-deps / musl issues.
# WORKDIR /src (not /app) so Vite alias "/app" -> resolve(cwd,"app") => /src/app, avoiding /app/app/app path clash.
FROM oven/bun:1 AS production-dependencies-env
WORKDIR /src
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1 AS build-env
WORKDIR /src
ARG VITE_CONTROL_PLANE_URL=https://api.studojo.com
ENV VITE_CONTROL_PLANE_URL=${VITE_CONTROL_PLANE_URL}
ARG VITE_PUBLIC_POSTHOG_KEY=""
ENV VITE_PUBLIC_POSTHOG_KEY=${VITE_PUBLIC_POSTHOG_KEY}
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# One-off stage: apply pending schema migrations.
# Built and pushed as `frontend-migrate:<sha>` by deploy.yml. The deploy
# workflow runs this image as a Kubernetes Job before promoting the new
# frontend image, so any SQL failure blocks the rollout.
FROM build-env AS db-push
WORKDIR /src
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*
# scripts/migrate.sh tracks applied files in a schema_migrations table so each
# migration runs exactly once across deploys.
COPY scripts/migrate.sh /usr/local/bin/migrate.sh
RUN chmod +x /usr/local/bin/migrate.sh
ENV MIGRATIONS_DIR=/src/drizzle
CMD ["/usr/local/bin/migrate.sh"]

# Final runtime stage
FROM node:20-bookworm-slim
WORKDIR /src
ENV PORT=3000

# Copy package files and install production dependencies
COPY package.json ./
RUN npm install --production --legacy-peer-deps && \
    npm cache clean --force

# Install global tools needed for migrations and scripts (smaller footprint)
RUN npm install -g drizzle-kit@^0.31.8 tsx typescript && \
    npm cache clean --force

# Copy built assets from build stage
COPY --from=build-env /src/build ./build

# Copy drizzle config and schema files needed for migrations
COPY --from=build-env /src/drizzle.config.ts ./
COPY --from=build-env /src/auth-schema.ts ./
COPY --from=build-env /src/drizzle ./drizzle

EXPOSE 3000
CMD ["npx", "react-router-serve", "./build/server/index.js"]
