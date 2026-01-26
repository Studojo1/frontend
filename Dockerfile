# Bun-based build and runtime. Uses Debian (glibc) to avoid rollup optional-deps / musl issues.
# WORKDIR /src (not /app) so Vite alias "/app" -> resolve(cwd,"app") => /src/app, avoiding /app/app/app path clash.
FROM oven/bun:1 AS production-dependencies-env
WORKDIR /src
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1 AS build-env
WORKDIR /src
ARG VITE_CONTROL_PLANE_URL=http://localhost:8080
ENV VITE_CONTROL_PLANE_URL=${VITE_CONTROL_PLANE_URL}
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# One-off stage: run auth migrations (user, session, etc.). Non-interactive; no push prompts.
FROM build-env AS db-push
WORKDIR /src
CMD ["bun", "x", "drizzle-kit", "push"]

# Run with Node: React Router server uses renderToPipeableStream etc.; Bun's react-dom/server stub lacks them.
FROM node:20-bookworm-slim
WORKDIR /src
ENV PORT=3000
COPY package.json bun.lockb ./
COPY --from=production-dependencies-env /src/node_modules /src/node_modules
COPY --from=build-env /src/build ./build
EXPOSE 3000
CMD ["npx", "react-router-serve", "./build/server/index.js"]
