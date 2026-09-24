import { getDatabaseClient } from "@kixihost/database";

// O Worker não corre dentro do NestJS (não tem injeção de
// dependências), por isso usa o singleton simples exportado por
// @kixihost/database em vez de PrismaService.
export const prisma = getDatabaseClient();
