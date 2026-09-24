import { Module } from "@nestjs/common";
import { DeploymentsModule } from "../deployments/deployments.module";
import { GitHubController } from "./github.controller";
import { GitHubService } from "./github.service";

@Module({
  imports: [DeploymentsModule],
  controllers: [GitHubController],
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}
