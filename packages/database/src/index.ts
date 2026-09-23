// @kixihost/database
//
// Ponto de entrada único para acesso à base de dados. Nenhum outro
// package ou app deve importar `@prisma/client` directamente.

export { PrismaClient } from "@prisma/client";
export type * from "@prisma/client";
export { PrismaService } from "./prisma.service";
export { PrismaModule } from "./prisma.module";

import { PrismaClient } from "@prisma/client";

let client: PrismaClient | undefined;

/**
 * Singleton simples para uso fora do contexto NestJS (ex.: worker,
 * scripts de seed/manutenção). Dentro da API, preferir sempre
 * `PrismaService` injectado via `PrismaModule`.
 */
export function getDatabaseClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}
