// Contrato de autenticação via GitHub OAuth ("Continuar com GitHub").
//
// Separado deliberadamente do GitHub App (ver packages/github) — OAuth
// serve apenas para autenticar o utilizador; o GitHub App é que obtém
// autorização sobre repositórios específicos (princípio do menor
// privilégio — regra 10).

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
