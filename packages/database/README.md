# @kixihost/database

Schema Prisma e cliente de base de dados partilhado do KixiHost.

## Estrutura

- `prisma/schema.prisma` — modelo de dados completo do Control Plane.
- `src/index.ts` — ponto de entrada único (`getDatabaseClient`).

## Regras

- Nenhum outro package deve importar `@prisma/client` directamente.
- Migrações correm via GitHub Actions em produção, nunca a partir de um
  computador local.
