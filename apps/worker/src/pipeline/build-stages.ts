import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { redactString } from "@kixihost/shared";
import { isSafeRelativePath } from "@kixihost/security";
import { writeDeploymentLog } from "../lib/deployment-transitions";

const execFileAsync = promisify(execFile);

const BUILD_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

async function runShellCommand(command: string, cwd: string): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync("sh", ["-c", command], {
      cwd,
      timeout: BUILD_TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT_BYTES,
      env: { ...process.env, CI: "true" },
    });
    return redactString(`${stdout}\n${stderr}`.trim());
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message: string };
    const output = redactString(`${err.stdout ?? ""}\n${err.stderr ?? ""}`.trim());
    throw new Error(output || err.message);
  }
}

export async function runFetchSourceStageReal(deploymentId: string, commitSha: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "build", `Código obtido para o commit ${commitSha}.`);
}

export async function runInstallDependenciesStageReal(deploymentId: string, workDir: string): Promise<void> {
  await writeDeploymentLog(deploymentId, "build", "A instalar dependências (pnpm install)...");
  const output = await runShellCommand("pnpm install --frozen-lockfile || pnpm install", workDir);
  await writeDeploymentLog(deploymentId, "build", output || "Dependências instaladas.");
}

export async function runBuildStageReal(
  deploymentId: string,
  workDir: string,
  buildCommand: string | null,
): Promise<void> {
  if (!buildCommand) {
    await writeDeploymentLog(
      deploymentId,
      "build",
      "Nenhum build command definido para este projecto — a saltar build.",
    );
    return;
  }

  await writeDeploymentLog(deploymentId, "build", `A construir: ${buildCommand}`);
  const output = await runShellCommand(buildCommand, workDir);
  await writeDeploymentLog(deploymentId, "build", output || "Build concluído.");
}

// Protecção contra path traversal (regra 36): o rootDirectory de um
// projecto vem de input do utilizador na criação do projecto (Fase 4)
// e é persistido — sem esta validação, um valor como "../../etc"
// permitiria escrever/ler fora do workspace isolado do deployment.
export function resolveWorkDir(workspaceRoot: string, rootDirectory: string): string {
  const normalized = rootDirectory || ".";

  if (normalized !== "." && !isSafeRelativePath(normalized)) {
    throw new Error(
      `rootDirectory inválido: "${normalized}" não é um caminho relativo seguro dentro do workspace.`,
    );
  }

  const resolved = path.join(workspaceRoot, normalized);
  const resolvedNormalized = path.normalize(resolved);

  // Defesa em profundidade: mesmo com isSafeRelativePath a passar,
  // confirma que o caminho final ainda está dentro do workspaceRoot.
  if (!resolvedNormalized.startsWith(path.normalize(workspaceRoot))) {
    throw new Error("rootDirectory resolveu para fora do workspace do deployment — bloqueado.");
  }

  return resolvedNormalized;
}
