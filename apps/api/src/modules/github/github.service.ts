import { Injectable } from "@nestjs/common";
import { getDatabaseClient } from "@kixihost/database";
import { GitHubAppClient, parseGitHubPushEvent } from "@kixihost/github";

@Injectable()
export class GitHubService {
  private readonly appClient: GitHubAppClient;
  private readonly db = getDatabaseClient();

  constructor() {
    this.appClient = new GitHubAppClient({
      appId: process.env.GITHUB_APP_ID ?? "",
      privateKeyPem: (process.env.GITHUB_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    });
  }

  async handlePushEvent(rawPayload: unknown): Promise<void> {
    const event = parseGitHubPushEvent(rawPayload);

    // Ignora pushes fora de branches relevantes (ex.: refs de tags).
    if (!event.ref.startsWith("refs/heads/")) return;

    const repository = await this.db.repository.findUnique({
      where: { githubRepoId: BigInt(0) }, // TODO(Fase 4): resolver pelo full_name real via índice dedicado
    });

    if (!repository) {
      // Repositório ainda não associado a nenhum projecto — nada a fazer.
      return;
    }

    // TODO(Fase 5): criar Deployment (status QUEUED) e publicar na queue
    // do worker, associando commit sha/branch/mensagem obtidos aqui.
  }

  async listInstallationRepositories(installationId: number) {
    return this.appClient.listAccessibleRepositories(installationId);
  }
}
