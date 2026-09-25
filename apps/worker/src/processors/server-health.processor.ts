import { PrismaIncidentEngine } from "@kixihost/monitoring";
import { Logger } from "@kixihost/logging";
import { prisma } from "../lib/prisma";
import { sshExec } from "../lib/ssh-exec";

const incidentEngine = new PrismaIncidentEngine(prisma);
const logger = new Logger("server-health");

const SSH_PRIVATE_KEY_PATH = process.env.KIXIHOST_SSH_PRIVATE_KEY_PATH ?? "/etc/kixihost/deploy_key";

// Corre periodicamente (ver main.ts). Para cada servidor "healthy",
// tenta um curl local ao container activo via SSH. Falhas consecutivas
// abrem um Incident e removem o servidor do pool — não tentamos
// recuperação automática total aqui (ver nota na regra 34: falhas
// graves do provider podem exigir intervenção manual).
export async function processServerHealthJob(): Promise<void> {
  const servers = await prisma.server.findMany({ where: { status: "healthy" } });

  for (const server of servers) {
    if (!server.ipAddress) continue;

    const start = Date.now();
    let healthy = false;
    let message: string | undefined;

    try {
      await sshExec(
        { host: server.ipAddress, username: "root", privateKeyPath: SSH_PRIVATE_KEY_PATH },
        "curl -sf http://localhost:80/ -o /dev/null",
      );
      healthy = true;
    } catch (error) {
      message = error instanceof Error ? error.message : "erro desconhecido";
    }

    await prisma.serverHealthCheck.create({
      data: {
        serverId: server.id,
        status: healthy ? "pass" : "fail",
        latencyMs: Date.now() - start,
      },
    });

    if (!healthy) {
      logger.warn("Servidor falhou health check", { serverId: server.id, hostname: server.hostname, message });

      const incidentId = await incidentEngine.detectAndOpen(
        `Servidor ${server.hostname} não está a responder`,
        message ?? "Health check via SSH falhou sem detalhe adicional.",
        "high",
      );
      await incidentEngine.removeUnhealthyServerFromPool(server.id);

      logger.error("Incidente aberto e servidor removido do pool", { incidentId, serverId: server.id });
      // NOTA HONESTA: provisionamento automático de substituto e
      // restauro completo do projecto ainda não estão implementados
      // aqui — requer intervenção manual nesta fase (ver regra 34).
    }
  }
}
