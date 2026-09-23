import { verifyHmacSignature } from "@kixihost/security";

// Verificação de webhooks do GitHub (push, pull_request, installation).
// GITHUB_WEBHOOK_SECRET nunca deve ser exposto fora deste package.

export function verifyGitHubWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  return verifyHmacSignature(rawBody, signatureHeader, secret, "sha256");
}

export interface GitHubPushEvent {
  repositoryFullName: string;
  ref: string; // e.g. "refs/heads/main"
  headCommitSha: string;
  headCommitMessage: string;
  installationId: number;
}

// TODO(Fase 2): parsing completo do payload real do evento `push`
// segundo a documentação oficial do GitHub Webhooks.
export function parseGitHubPushEvent(_rawPayload: unknown): GitHubPushEvent {
  throw new Error("parseGitHubPushEvent: not yet implemented (Fase 2)");
}
