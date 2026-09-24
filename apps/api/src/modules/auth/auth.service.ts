import { Injectable } from "@nestjs/common";
import { PrismaService } from "@kixihost/database";
import { GitHubOAuthClient, type GitHubOAuthProfile } from "@kixihost/auth";
import { KixiError } from "@kixihost/shared";
import { SessionAuthService } from "./session-auth.service";

@Injectable()
export class AuthService {
  private readonly oauthClient: GitHubOAuthClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionAuthService: SessionAuthService,
  ) {
    this.oauthClient = new GitHubOAuthClient({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      callbackUrl: `${process.env.API_URL}/auth/github/callback`,
    });
  }

  getAuthorizationUrl(state: string): string {
    return this.oauthClient.getAuthorizationUrl(state);
  }

  async handleCallback(code: string, ipAddress?: string, userAgent?: string): Promise<string> {
    let profile: GitHubOAuthProfile;
    let accessToken: string;

    try {
      const token = await this.oauthClient.exchangeCodeForToken(code);
      accessToken = token.accessToken;
      profile = await this.oauthClient.fetchProfile(accessToken);
    } catch (error) {
      throw new KixiError({
        code: "KIXI_GITHUB_ACCESS_ERROR",
        title: "Falha na autenticação com o GitHub",
        message: "Não foi possível concluir a autenticação com o GitHub.",
        action: "Tente novamente.",
        retryable: true,
        internal: { provider: "github", cause: error },
      });
    }

    if (!profile.email) {
      throw new KixiError({
        code: "KIXI_GITHUB_ACCESS_ERROR",
        title: "Email do GitHub indisponível",
        message: "A tua conta do GitHub não tem um email público ou verificado acessível.",
        action: "Torna um email verificado público no GitHub e tenta novamente.",
        retryable: true,
      });
    }

    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      create: { email: profile.email, status: "PENDING_ONBOARDING" },
      update: {},
    });

    await this.prisma.gitHubAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        githubUserId: BigInt(profile.githubUserId),
        username: profile.username,
        accessToken, // TODO(Fase 3+): encriptar via @kixihost/security antes de persistir
      },
      update: {
        username: profile.username,
        accessToken,
      },
    });

    return this.sessionAuthService.create(user.id, ipAddress, userAgent);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionAuthService.revoke(sessionId);
  }
}
