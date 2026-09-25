import { Module } from "@nestjs/common";
import { PrismaModule } from "@kixihost/database";
import { AuthModule } from "./modules/auth/auth.module";
import { GitHubModule } from "./modules/github/github.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { DeploymentsModule } from "./modules/deployments/deployments.module";
import { DomainsModule } from "./modules/domains/domains.module";
import { BillingModule } from "./modules/billing/billing.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GitHubModule,
    ProjectsModule,
    DeploymentsModule,
    DomainsModule,
    BillingModule,
    HealthModule,
  ],
})
export class AppModule {}
