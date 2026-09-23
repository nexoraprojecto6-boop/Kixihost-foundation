import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// Serviço Prisma gerido pelo ciclo de vida do NestJS — substitui o
// singleton simples usado na fundação inicial. Injectado em qualquer
// módulo via `PrismaService`, nunca instanciando PrismaClient
// directamente fora daqui.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
