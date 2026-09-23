# KixiHost Web — multi-stage Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @kixihost/web...

FROM base AS build
COPY --from=deps /app /app
COPY apps/web apps/web
RUN pnpm --filter @kixihost/web build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "--filter", "@kixihost/web", "start"]
