import { Injectable } from "@nestjs/common";
import { getDatabaseClient } from "@kixihost/database";
import { GitHubOAuthClient, JwtSessionService, type GitHubOAuthProfile } from "@kixihost/auth";
import { KixiError } from "@kixihost/shared";

@Injectable()
export class AuthService {
  private readonly oauthClient: GitHubOAuthClient;
  private readonly sessionService: JwtSessionService;
  private readonly db = getDatabaseClient();

  constructor() {
    this.oauthClient = new GitHubOAuthClient({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      callbackUrl: `${process.env.API_URL}/auth/github/callback`,
    });

    this.sessionService = new JwtSessionService(
      process.env.SESSION_SECRET ?? "",
      async (userId, sessionId, expiresAt, ipAddress, userAgent) => {
        await this.db.session.create({
          data: { id: sessionId, userId, expiresAt, ipAddress, userAgent },
        });
      },
      async (sessionId) => {
        const session = await this.db.session.findUnique({ where: { id: sessionId } });
        return !session || session.expiresAt < new Date();
      },
      async (sessionId) => {
        await this.db.session.delete({ where: { id: sessionId } }).catch(() => undefined);
      },
    );
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

    const user = await this.db.user.upsert({
      where: { email: profile.email },
      create: { email: profile.email, status: "PENDING_ONBOARDING" },
      update: {},
    });

    await this.db.gitHubAccount.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        githubUserId: BigInt(profile.githubUserId),
        username: profile.username,
        accessToken, // TODO(Fase 3): encriptar via @kixihost/security antes de persistir
      },
      update: {
        username: profile.username,
        accessToken,
      },
    });

    return this.sessionService.create(user.id, ipAddress, userAgent);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revoke(sessionId);
  }
}
