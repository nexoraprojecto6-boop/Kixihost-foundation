import { verifyHmacSignature } from "@kixihost/security";

export function verifyGitHubWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  return verifyHmacSignature(rawBody, signatureHeader, secret, "sha256");
}

export interface GitHubPushEvent {
  repositoryFullName: string;
  ref: string;
  headCommitSha: string;
  headCommitMessage: string;
  installationId: number;
}

interface RawGitHubPushPayload {
  ref: string;
  after: string;
  repository: { full_name: string };
  installation?: { id: number };
  head_commit?: { message: string };
}

export function parseGitHubPushEvent(rawPayload: unknown): GitHubPushEvent {
  const payload = rawPayload as RawGitHubPushPayload;

  if (!payload.repository?.full_name || !payload.after || !payload.ref) {
    throw new Error("Payload de push do GitHub inválido ou incompleto");
  }

  return {
    repositoryFullName: payload.repository.full_name,
    ref: payload.ref,
    headCommitSha: payload.after,
    headCommitMessage: payload.head_commit?.message ?? "",
    installationId: payload.installation?.id ?? 0,
  };
}
