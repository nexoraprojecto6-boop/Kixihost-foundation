# KixiHost API — multi-stage Dockerfile
# Construído pelo GitHub Actions / Worker em produção, nunca localmente
# como dependência de deployment (ver regra 46).

FROM node:25-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @kixihost/api...

FROM base AS build
COPY --from=deps /app /app
COPY apps/api apps/api
RUN pnpm --filter @kixihost/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
