import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { GitHubAppClient, parseGitHubPushEvent } from "@kixihost/github";
import { DeploymentsService } from "../deployments/deployments.service";

@Injectable()
export class GitHubService {
  private readonly appClient: GitHubAppClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly deploymentsService: DeploymentsService,
  ) {
    this.appClient = new GitHubAppClient({
      appId: process.env.GITHUB_APP_ID ?? "",
      privateKeyPem: (process.env.GITHUB_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    });
  }

  async handlePushEvent(rawPayload: unknown): Promise<void> {
    const event = parseGitHubPushEvent(rawPayload);

    // Ignora pushes fora de branches (ex.: tags).
    if (!event.ref.startsWith("refs/heads/")) return;
    const branch = event.ref.replace("refs/heads/", "");

    const repository = await this.prisma.repository.findFirst({
      where: { fullName: event.repositoryFullName },
      include: { projects: true },
    });

    if (!repository || repository.projects.length === 0) {
      // Repositório ainda não associado a nenhum projecto KixiHost — ignorar.
      return;
    }

    // Cria um Deployment para cada projecto ligado a este repositório
    // cuja branch corresponde ao branch por omissão do repositório.
    for (const project of repository.projects) {
      if (branch !== repository.defaultBranch) continue;

      await this.deploymentsService.createFromPush({
        projectId: project.id,
        commitSha: event.headCommitSha,
        commitMessage: event.headCommitMessage,
        branch,
        triggeredBy: "webhook",
      });
    }
  }

  async listInstallationRepositories(installationId: number) {
    return this.appClient.listAccessibleRepositories(installationId);
  }
}
