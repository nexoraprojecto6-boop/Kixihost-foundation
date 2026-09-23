# KixiHost Admin — multi-stage Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @kixihost/admin...

FROM base AS build
COPY --from=deps /app /app
COPY apps/admin apps/admin
RUN pnpm --filter @kixihost/admin build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/apps/admin ./apps/admin
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3001
CMD ["pnpm", "--filter", "@kixihost/admin", "start"]
