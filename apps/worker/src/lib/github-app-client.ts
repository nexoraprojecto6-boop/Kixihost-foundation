import { GitHubAppClient } from "@kixihost/github";

// Cliente partilhado da GitHub App, usado para obter tokens de
// instalação e descarregar o código-fonte dos repositórios
// autorizados. As mesmas credenciais (GITHUB_APP_ID/GITHUB_PRIVATE_KEY)
// já usadas pela API — o Worker nunca usa um token de utilizador.
export const githubAppClient = new GitHubAppClient({
  appId: process.env.GITHUB_APP_ID ?? "",
  privateKeyPem: (process.env.GITHUB_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
});
