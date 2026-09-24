import { readFileSync } from "node:fs";
import { ProviderFactory } from "@kixihost/providers";
import { prisma } from "./prisma";
import { waitForSshReady, type SshTarget } from "./ssh-exec";

const CLOUD_INIT = readFileSync(
  new URL("../../../../infrastructure/docker/droplet-cloud-init.yaml", import.meta.url),
  "utf-8",
);

const providerFactory = new ProviderFactory({
  digitalocean: { apiToken: process.env.DIGITALOCEAN_API_TOKEN ?? "" },
});

const SSH_PRIVATE_KEY_PATH = process.env.KIXIHOST_SSH_PRIVATE_KEY_PATH ?? "/etc/kixihost/deploy_key";
const DEFAULT_REGION = "fra1";

export interface ProvisionedServer {
  serverId: string; // id do registo Server na nossa base de dados
  ipAddress: string;
  ssh: SshTarget;
}

// Garante que existe um servidor DigitalOcean activo e pronto (SSH
// disponível) para o projecto indicado, reaproveitando-o entre
// deployments em vez de criar um Droplet novo a cada push.
export async function ensureProjectServer(projectId: string): Promise<ProvisionedServer> {
  const provider = providerFactory.create("digitalocean");

  let serverRecord = await prisma.serverAllocation.findFirst({
    where: { projectId },
    include: { server: true },
  });

  if (!serverRecord) {
    const infraProvider = await prisma.infrastructureProvider.upsert({
      where: { name: "digitalocean" },
      create: { name: "digitalocean", region: DEFAULT_REGION },
      update: {},
    });

    const created = await provider.createServer({
      projectId,
      region: DEFAULT_REGION,
      size: "small",
      image: CLOUD_INIT, // ver nota no digitalocean-provider.ts sobre este campo
    });

    const server = await prisma.server.create({
      data: {
        providerId: infraProvider.id,
        externalId: created.externalId,
        hostname: created.hostname,
        status: "provisioning",
      },
    });

    serverRecord = await prisma.serverAllocation.create({
      data: { serverId: server.id, projectId },
      include: { server: true },
    });
  }

  // Espera o Droplet ficar `active` e obter IP público, se ainda não tiver.
  let server = serverRecord.server;
  if (server.status !== "healthy" || !server.ipAddress) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const status = await provider.getServerStatus(server.externalId);
      if (status.status === "active" && status.ipAddress) {
        server = await prisma.server.update({
          where: { id: server.id },
          data: { status: "healthy", ipAddress: status.ipAddress },
        });
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  if (!server.ipAddress) {
    throw new Error("O servidor não ficou disponível a tempo (timeout de provisionamento).");
  }

  const ssh: SshTarget = {
    host: server.ipAddress,
    username: "root",
    privateKeyPath: SSH_PRIVATE_KEY_PATH,
  };

  await waitForSshReady(ssh);

  return { serverId: server.id, ipAddress: server.ipAddress, ssh };
}
