import jwt from "jsonwebtoken";

// GitHub App — usado exclusivamente para autorização de repositórios e
// operações de deployment (separado do GitHub OAuth, que serve só para
// login). Princípio do menor privilégio: só acede aos repositórios que
// o utilizador autorizou explicitamente na instalação da App.

export interface GitHubInstallationInfo {
  installationId: number;
  accountLogin: string;
  accountType: "User" | "Organization";
}

export interface GitHubAppConfig {
  appId: string;
  privateKeyPem: string;
}

export interface GitHubAppService {
  getInstallationAccessToken(installationId: number): Promise<string>;
  listAccessibleRepositories(installationId: number): Promise
    Array<{ id: number; fullName: string; defaultBranch: string; private: boolean }>
  >;
  fetchCommit(installationId: number, repoFullName: string, sha: string): Promise<{
    sha: string;
    message: string;
    author: string;
  }>;
}

export class GitHubAppClient implements GitHubAppService {
  constructor(private readonly config: GitHubAppConfig) {}

  /** JWT de app (10 min), usado só para trocar por um installation access token. */
  private createAppJwt(): string {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
      { iat: now - 60, exp: now + 9 * 60, iss: this.config.appId },
      this.config.privateKeyPem,
      { algorithm: "RS256" },
    );
  }

  async getInstallationAccessToken(installationId: number): Promise<string> {
    const appJwt = this.createAppJwt();
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub installation token failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as { token: string };
    return data.token;
  }

  async listAccessibleRepositories(installationId: number) {
    const token = await this.getInstallationAccessToken(installationId);
    const response = await fetch("https://api.github.com/installation/repositories", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub list repositories failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      repositories: Array<{ id: number; full_name: string; default_branch: string; private: boolean }>;
    };

    return data.repositories.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      defaultBranch: r.default_branch,
      private: r.private,
    }));
  }

  async fetchCommit(installationId: number, repoFullName: string, sha: string) {
    const token = await this.getInstallationAccessToken(installationId);
    const response = await fetch(`https://api.github.com/repos/${repoFullName}/commits/${sha}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub fetch commit failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      sha: string;
      commit: { message: string; author: { name: string } };
    };

    return { sha: data.sha, message: data.commit.message, author: data.commit.author.name };
  }
}
