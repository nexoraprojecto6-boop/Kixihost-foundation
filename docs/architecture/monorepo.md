# Estrutura do Monorepo

```
kixihost/
├── apps/        (web, api, worker, admin)
├── packages/    (database, auth, security, providers, deployments,
│                 billing, payments, logging, monitoring, domains,
│                 github, notifications, validation, shared, ui,
│                 i18n, config)
├── infrastructure/ (docker, terraform, cloudflare, monitoring)
├── security/
├── docs/
├── scripts/
└── tests/
```

Gerido com pnpm workspaces + Turborepo. Cada package expõe um único
ponto de entrada (`src/index.ts`) e é consumido via `@kixihost/<nome>`.
