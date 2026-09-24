import { Module } from "@nestjs/common";
import { PrismaModule } from "@kixihost/database";
import { AuthModule } from "./modules/auth/auth.module";
import { GitHubModule } from "./modules/github/github.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { DeploymentsModule } from "./modules/deployments/deployments.module";
import { DomainsModule } from "./modules/domains/domains.module";

@Module({
  imports: [PrismaModule, AuthModule, GitHubModule, ProjectsModule, DeploymentsModule, DomainsModule],
})
export class AppModule {}
