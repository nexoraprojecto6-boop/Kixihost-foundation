import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// @Global() para que qualquer módulo (auth, github, projects,
// deployments, billing...) injecte PrismaService sem reimportar este
// módulo em cada um.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
