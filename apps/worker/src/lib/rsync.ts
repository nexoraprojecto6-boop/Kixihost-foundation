import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SshTarget } from "./ssh-exec";

const execFileAsync = promisify(execFile);

export interface RsyncParams {
  localDir: string;
  remoteDir: string;
  ssh: SshTarget;
}

// Sincroniza o código já construído localmente (workspaceDir, depois
// de pnpm install + build) para o Droplet do projeto, via rsync sobre
// SSH com a chave privada da plataforma. Usa o binário `rsync` do
// sistema (instalado por defeito na imagem base da GitHub Actions e
// em qualquer imagem Linux comum) em vez de reimplementar
// transferência de ficheiros à mão.
export async function syncWorkspaceToServer(params: RsyncParams): Promise<void> {
  const { localDir, remoteDir, ssh } = params;

  const sshCommand = `ssh -i ${ssh.privateKeyPath} -o StrictHostKeyChecking=accept-new`;

  await execFileAsync(
    "ssh",
    [
      "-i",
      ssh.privateKeyPath,
      "-o",
      "StrictHostKeyChecking=accept-new",
      `${ssh.username}@${ssh.host}`,
      `mkdir -p ${remoteDir}`,
    ],
    { timeout: 30_000 },
  );

  await execFileAsync(
    "rsync",
    [
      "-az",
      "--delete",
      "-e",
      sshCommand,
      "--exclude",
      "node_modules",
      "--exclude",
      ".git",
      `${localDir.endsWith("/") ? localDir : `${localDir}/`}`,
      `${ssh.username}@${ssh.host}:${remoteDir}`,
    ],
    { timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 },
  );
}
