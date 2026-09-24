import { mkdtemp, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import * as tar from "tar";

// Cria um diretório temporário isolado por deployment. Nunca
// partilhado entre deployments, e sempre apagado no fim do pipeline
// (sucesso ou falha) — ver destroyWorkspaceDir.
export async function createWorkspaceDir(deploymentId: string): Promise<string> {
  return mkdtemp(path.join(tmpdir(), `kixi-deploy-${deploymentId}-`));
}

export async function destroyWorkspaceDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export interface DownloadSourceParams {
  installationToken: string;
  repoFullName: string;
  commitSha: string;
  targetDir: string;
}

// Obtém o código-fonte através da API oficial do GitHub (tarball da
// installation autorizada) — nunca via `git clone` com o token exposto
// em linha de comando ou variável de ambiente do processo filho.
export async function downloadAndExtractSource(params: DownloadSourceParams): Promise<void> {
  const { installationToken, repoFullName, commitSha, targetDir } = params;

  const response = await fetch(`https://api.github.com/repos/${repoFullName}/tarball/${commitSha}`, {
    headers: {
      Authorization: `Bearer ${installationToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Falha ao obter o código-fonte do GitHub: HTTP ${response.status}`);
  }

  const tarballPath = path.join(targetDir, "source.tar.gz");
  await pipeline(
    Readable.fromWeb(response.body as unknown as WebReadableStream<Uint8Array>),
    createWriteStream(tarballPath),
  );

  // O tarball do GitHub vem sempre com um único diretório de topo
  // (owner-repo-sha); strip:1 remove-o para o código ficar
  // directamente em targetDir.
  await tar.extract({ file: tarballPath, cwd: targetDir, strip: 1 });
  await rm(tarballPath, { force: true });
}
