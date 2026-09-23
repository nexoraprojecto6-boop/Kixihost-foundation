import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { GitHubModule } from "./modules/github/github.module";

// Módulos das fases seguintes (projects, deployments, domains, billing,
// payments, admin) serão importados aqui à medida que forem
// implementados — ver apps/api/src/modules/README.md.
@Module({
  imports: [AuthModule, GitHubModule],
})
export class AppModule {}
