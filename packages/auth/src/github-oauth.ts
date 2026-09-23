// GitHub OAuth — usado exclusivamente para autenticar o utilizador
// ("Continuar com GitHub"). Separado do GitHub App (packages/github),
// que trata apenas de autorização de repositórios (regra 10).

export interface GitHubOAuthProfile {
  githubUserId: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

export interface GitHubOAuthService {
  getAuthorizationUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken?: string }>;
  fetchProfile(accessToken: string): Promise<GitHubOAuthProfile>;
}

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

// Implementação real usando a API pública do GitHub (login/oauth e /user).
export class GitHubOAuthClient implements GitHubOAuthService {
  constructor(private readonly config: GitHubOAuthConfig) {}

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.callbackUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub OAuth token exchange failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as { access_token?: string; error?: string };
    if (!data.access_token) {
      throw new Error(`GitHub OAuth token exchange failed: ${data.error ?? "unknown error"}`);
    }

    return { accessToken: data.access_token };
  }

  async fetchProfile(accessToken: string): Promise<GitHubOAuthProfile> {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub profile fetch failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      id: number;
      login: string;
      email: string | null;
      avatar_url: string | null;
    };

    let email = data.email;
    if (!email) {
      // O email pode estar privado — consultar o endpoint dedicado.
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as Array<{ email: string; primary: boolean }>;
        email = emails.find((e) => e.primary)?.email ?? emails[0]?.email ?? null;
      }
    }

    return {
      githubUserId: data.id,
      username: data.login,
      email,
      avatarUrl: data.avatar_url,
    };
  }
}
