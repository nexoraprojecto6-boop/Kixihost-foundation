# KixiHost Worker — multi-stage Dockerfile
FROM node:25-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @kixihost/worker...

FROM base AS build
COPY --from=deps /app /app
COPY apps/worker apps/worker
RUN pnpm --filter @kixihost/worker build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
