import { createHash } from "node:crypto";
import { sshExec, type SshTarget } from "../lib/ssh-exec";
import { writeDeploymentLog } from "../lib/deployment-transitions";

// Deploy blue/green simples sobre um único Droplet por projecto:
// - a versão activa corre sempre na porta 8080 ou 8081 (alternando)
// - a nova versão sobe na porta livre, é validada por health check,
//   e só depois o Caddy passa a apontar para ela — a versão anterior
//   só é parada DEPOIS da troca (nunca antes), cumprindo a regra de
//   nunca derrubar a versão activa por causa de um deploy que falhou.

const BLUE_PORT = 8080;
const GREEN_PORT = 8081;

function imageTagFor(deploymentId: string): string {
  const short = createHash("sha256").update(deploymentId).digest("hex").slice(0, 12);
  return `kixihost-${short}:latest`;
}

async function getActivePort(ssh: SshTarget): Promise<number> {
  try {
    const output = await sshExec(ssh, "docker ps --filter name=kixi-app --format '{{.Names}}'");
    if (output.includes(`kixi-app-${GREEN_PORT}`)) return GREEN_PORT;
    return BLUE_PORT;
  } catch {
    return BLUE_PORT;
  }
}

export async function runContainerizeStage(
  deploymentId: string,
  ssh: SshTarget,
  workDir: string,
): Promise<{ newPort: number; imageTag: string }> {
  await writeDeploymentLog(deploymentId, "deploy", "A construir a imagem Docker no servidor...");

  const activePort = await getActivePort(ssh);
  const newPort = activePort === BLUE_PORT ? GREEN_PORT : BLUE_PORT;
  const imageTag = imageTagFor(deploymentId);

  // NOTA(Fase 5C3 — simplificação assumida): esta etapa assume que o
  // código já foi copiado para `workDir` NO SERVIDOR remoto por um
  // passo de sincronização anterior (rsync/scp), que ainda não está
  // implementado aqui — ver TODO abaixo. Por agora, documentamos o
  // contrato e o fluxo de portas/health-check/traffic-switch, que é a
  // parte que define a arquitectura de deployment sem downtime.
  // TODO(Fase 5C3 — follow-up): sincronizar workDir local → workDir remoto
  // (rsync via SSH) antes deste `docker build`.
  await sshExec(ssh, `cd ${workDir} && docker build -t ${imageTag} .`);

  await writeDeploymentLog(deploymentId, "deploy", `A arrancar o novo container na porta ${newPort}...`);
  await sshExec(
    ssh,
    `docker rm -f kixi-app-${newPort} 2>/dev/null; docker run -d --name kixi-app-${newPort} -p ${newPort}:3000 --restart unless-stopped ${imageTag}`,
  );

  return { newPort, imageTag };
}

export async function runHealthCheckStage(deploymentId: string, ssh: SshTarget, port: number): Promise<void> {
  await writeDeploymentLog(deploymentId, "health_check", `A verificar saúde do container na porta ${port}...`);

  const maxAttempts = 15;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sshExec(ssh, `curl -sf http://localhost:${port}/ -o /dev/null`);
      await writeDeploymentLog(deploymentId, "health_check", "Health check passou.");
      return;
    } catch {
      if (attempt === maxAttempts) {
        // Container que falhou o health check é removido — nunca fica
        // a ocupar a porta "green" bloqueando o próximo deploy — mas a
        // versão activa antiga (na outra porta) permanece intocada.
        await sshExec(ssh, `docker rm -f kixi-app-${port} 2>/dev/null || true`);
        throw new Error(
          `O container não respondeu com sucesso em http://localhost:${port}/ após ${maxAttempts} tentativas.`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }
}

export async function runTrafficSwitchStage(deploymentId: string, ssh: SshTarget, newPort: number): Promise<void> {
  await writeDeploymentLog(deploymentId, "deploy", `A encaminhar tráfego para a porta ${newPort}...`);

  await sshExec(
    ssh,
    `echo ':80 {\\n  reverse_proxy localhost:${newPort}\\n}' > /etc/caddy/Caddyfile && systemctl reload caddy`,
  );

  const oldPort = newPort === BLUE_PORT ? GREEN_PORT : BLUE_PORT;
  // Só paramos a versão antiga DEPOIS do tráfego já estar a apontar
  // para a nova — nunca antes (regra 12: nunca derrubar a versão
  // activa automaticamente antes de confirmar a nova).
  await sshExec(ssh, `docker rm -f kixi-app-${oldPort} 2>/dev/null || true`);

  await writeDeploymentLog(deploymentId, "deploy", "Tráfego encaminhado para a nova versão.");
}
