import { CloudflareClient, buildSubdomainHostname } from "@kixihost/domains";
import { prisma } from "./prisma";
import { writeDeploymentLog } from "./deployment-transitions";

const BASE_DOMAIN = process.env.CLOUDFLARE_ZONE_NAME ?? "kixihost.ao";

const cloudflare = new CloudflareClient({
  apiToken: process.env.CLOUDFLARE_API_TOKEN ?? "",
  zoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
  zoneName: BASE_DOMAIN,
});

// Garante que o subdomínio automático do projecto existe e aponta
// para o servidor actual — chamado depois de cada deployment ficar
// ACTIVE (regra 19: "project.kixihost.ao deve poder ser
// disponibilizado" após o deployment).
export async function ensureSubdomainForProject(
  deploymentId: string,
  projectId: string,
  slug: string,
  serverIp: string,
): Promise<void> {
  const hostname = buildSubdomainHostname(slug, BASE_DOMAIN);

  await cloudflare.upsertDnsRecord({ type: "A", name: hostname, content: serverIp, proxied: true });

  const domain = await prisma.domain.upsert({
    where: { hostname },
    create: { projectId, hostname, isSubdomain: true, verified: true },
    update: {},
  });

  const existingCert = await prisma.certificate.findFirst({ where: { domainId: domain.id } });
  if (!existingCert) {
    await prisma.certificate.create({
      data: { domainId: domain.id, issuer: "cloudflare", status: "active", issuedAt: new Date() },
    });
  }

  await writeDeploymentLog(deploymentId, "domain", `Subdomínio disponível em https://${hostname}`);
}
