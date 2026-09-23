// GitHub App — usado exclusivamente para autorização de repositórios e
// operações de deployment (separado do GitHub OAuth em @kixihost/auth,
// que serve apenas para login). Ver regra 10: princípio do menor
// privilégio, nunca acesso indiscriminado a todos os repositórios.

export interface GitHubInstallationInfo {
  installationId: number;
  accountLogin: string;
  accountType: "User" | "Organization";
}

export interface GitHubAppService {
  getInstallationAccessToken(installationId: number): Promise<string>;
  listAccessibleRepositories(installationId: number): Promise<
    Array<{ id: number; fullName: string; defaultBranch: string; private: boolean }>
  >;
  fetchCommit(installationId: number, repoFullName: string, sha: string): Promise<{
    sha: string;
    message: string;
    author: string;
  }>;
}
