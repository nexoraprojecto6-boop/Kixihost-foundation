import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { GitHubAppClient, detectFramework } from "@kixihost/github";
import { KixiError } from "@kixihost/shared";
import type { CreateProjectInput } from "@kixihost/validation";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

@Injectable()
export class ProjectsService {
  private readonly appClient: GitHubAppClient;

  constructor(private readonly prisma: PrismaService) {
    this.appClient = new GitHubAppClient({
      appId: process.env.GITHUB_APP_ID ?? "",
      privateKeyPem: (process.env.GITHUB_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    });
  }

  /** Repositórios acessíveis ao utilizador, através das suas GitHubInstallations. */
  async listAvailableRepositories(userId: string) {
    const account = await this.prisma.gitHubAccount.findUnique({
      where: { userId },
      include: { installations: true },
    });

    if (!account || account.installations.length === 0) {
      throw new KixiError({
        code: "KIXI_GITHUB_ACCESS_ERROR",
        title: "Nenhuma instalação do GitHub App encontrada",
        message: "Ainda não autorizaste o KixiHost a aceder a nenhum repositório.",
        action: "Autoriza a GitHub App para continuar.",
        retryable: false,
      });
    }

    const results = [];
    for (const installation of account.installations) {
      const repos = await this.appClient.listAccessibleRepositories(
        Number(installation.installationId),
      );
      results.push(...repos.map((r) => ({ ...r, installationId: installation.id })));
    }
    return results;
  }

  async createProject(userId: string, input: CreateProjectInput) {
    const repository = await this.prisma.repository.findUnique({
      where: { id: input.repositoryId },
      include: { installation: { include: { githubAccount: true } } },
    });

    if (!repository || repository.installation.githubAccount.userId !== userId) {
      throw new NotFoundException("Repositório não encontrado ou não autorizado para este utilizador.");
    }

    // Buscar package.json do repositório via GitHub App para detetar o framework.
    let packageJson: Record<string, unknown> | undefined;
    try {
      const token = await this.appClient.getInstallationAccessToken(
        Number(repository.installation.installationId),
      );
      const response = await fetch(
        `https://api.github.com/repos/${repository.fullName}/contents/package.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.raw+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );
      if (response.ok) {
        packageJson = (await response.json()) as Record<string, unknown>;
      }
    } catch {
      // Ausência de package.json (ex.: projecto estático) não é um erro fatal.
    }

    const detection = detectFramework({ packageJson, fileList: packageJson ? ["package.json"] : [] });

    const baseSlug = slugify(input.name);
    let slug = baseSlug;
    let attempt = 1;
    while (await this.prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`;
    }

    const project = await this.prisma.project.create({
      data: {
        userId,
        repositoryId: repository.id,
        name: input.name,
        slug,
        framework: detection.framework,
        rootDirectory: input.rootDirectory,
        buildCommand: input.buildCommand ?? detection.buildCommand ?? undefined,
        outputDirectory: input.outputDirectory ?? detection.outputDirectory ?? undefined,
      },
    });

    await this.prisma.projectEnvironment.create({
      data: { projectId: project.id, name: "production", variables: {} },
    });

    return project;
  }

  async listProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { domains: true },
    });
  }

  async getProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { deployments: { orderBy: { createdAt: "desc" }, take: 10 }, domains: true },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException("Projecto não encontrado.");
    }

    return project;
  }
}
