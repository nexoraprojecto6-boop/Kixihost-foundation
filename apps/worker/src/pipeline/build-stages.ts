import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { redactString } from "@kixihost/shared";
import { writeDeploymentLog } from "../lib/deployment-transitions";

const execFileAsync = promisify(execFile);

// Limites de primeira linha de defesa enquanto a containerização real
// (Fase 5C3) ainda não isola completamente o processo de build.
// Nunca depender só disto em produção — ver regra 37 (código de
// clientes é não confiável).
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

export function resolveWorkDir(workspaceRoot: string, rootDirectory: string): string {
  return path.join(workspaceRoot, rootDirectory || ".");
}
