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
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# One-off stage: run auth migrations (user, session, etc.). Non-interactive; no push prompts.
FROM build-env AS db-push
WORKDIR /src
# Install postgresql-client to run migrations
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
# Run migrations using psql in sorted order
CMD ["sh", "-c", "for file in $(ls -1 drizzle/*.sql | sort); do echo \"Running migration: $file\"; psql $DATABASE_URL -f \"$file\" || exit 1; done"]

# Run with Node: React Router server uses renderToPipeableStream etc.; Bun's react-dom/server stub lacks them.
FROM node:20-bookworm-slim
WORKDIR /src
ENV PORT=3000

# Install system dependencies for canvas (native module)
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json ./

# Install all production dependencies with npm (for Node.js compatibility)
# Install canvas and pdfjs-dist explicitly for PDF to PNG conversion
RUN npm install --production && \
    npm install canvas pdfjs-dist

# Install global tools needed for migrations and scripts
RUN npm install -g drizzle-kit@^0.31.8 tsx typescript

# Copy built assets from build stage
COPY --from=build-env /src/build ./build

# Copy drizzle config and schema files needed for migrations
COPY --from=build-env /src/drizzle.config.ts ./
COPY --from=build-env /src/auth-schema.ts ./
COPY --from=build-env /src/drizzle ./drizzle

EXPOSE 3000
CMD ["npx", "react-router-serve", "./build/server/index.js"]
