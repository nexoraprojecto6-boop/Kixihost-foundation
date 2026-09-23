// @kixihost/database
//
// Ponto de entrada único para acesso à base de dados. Nenhum outro
// package ou app deve importar `@prisma/client` directamente — tudo
// passa por aqui, para que possamos controlar connection pooling,
// logging de queries e futuras migrações de ORM num único lugar.

export { PrismaClient } from "@prisma/client";
export type * from "@prisma/client";

import { PrismaClient } from "@prisma/client";

let client: PrismaClient | undefined;

/**
 * Devolve uma instância singleton do PrismaClient.
 * Não é chamada durante a criação da fundação — apenas definida
 * para uso futuro pelas apps (api, worker).
 */
export function getDatabaseClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
  }
  return client;
}
