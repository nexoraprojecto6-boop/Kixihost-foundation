import { Module } from "@nestjs/common";
import { PrismaModule } from "@kixihost/database";
import { AuthModule } from "./modules/auth/auth.module";
import { GitHubModule } from "./modules/github/github.module";
import { ProjectsModule } from "./modules/projects/projects.module";

@Module({
  imports: [PrismaModule, AuthModule, GitHubModule, ProjectsModule],
})
export class ProjectsModuleRoot {}
