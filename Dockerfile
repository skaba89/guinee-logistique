FROM oven/bun:1.3.4 AS bun
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL=file:/tmp/unused-demo.db bun run db:generate && \
    SAAS_DATABASE_URL=postgresql://unused:unused@localhost:5432/unused bun x prisma generate --schema prisma/saas/schema.prisma && \
    DATABASE_URL=file:/tmp/unused-demo.db bun run build

FROM build AS migrate
CMD ["bun", "x", "prisma", "migrate", "deploy", "--schema", "prisma/saas/schema.prisma"]

FROM base AS app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 SAAS_AUTH_ENABLED=true
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/generated/saas ./generated/saas
USER node
EXPOSE 3000
CMD ["node", "server.js"]
