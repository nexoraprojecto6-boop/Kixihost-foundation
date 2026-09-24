import { Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { PrismaService } from "@kixihost/database";
import {
  CloudflareClient,
  buildSubdomainHostname,
  verifyCnameRecord,
  verifyTxtRecord,
} from "@kixihost/domains";
import { KixiError } from "@kixihost/shared";

const BASE_DOMAIN = process.env.CLOUDFLARE_ZONE_NAME ?? "kixihost.ao";

@Injectable()
export class DomainsService {
  private readonly cloudflare: CloudflareClient;

  constructor(private readonly prisma: PrismaService) {
    this.cloudflare = new CloudflareClient({
      apiToken: process.env.CLOUDFLARE_API_TOKEN ?? "",
      zoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
      zoneName: BASE_DOMAIN,
    });
  }

  /** Cria (ou reaproveita) o subdomínio automático do projecto, apontado para o IP do servidor. */
  async assignSubdomain(projectId: string, slug: string, targetIp: string) {
    const hostname = buildSubdomainHostname(slug, BASE_DOMAIN);

    try {
      await this.cloudflare.upsertDnsRecord({
        type: "A",
        name: hostname,
        content: targetIp,
        proxied: true, // proxied = Cloudflare Universal SSL automático
      });
    } catch (error) {
      throw new KixiError({
        code: "KIXI_DOMAIN_DNS_ERROR",
        title: "Falha ao configurar o subdomínio",
        message: "Não foi possível configurar o DNS do teu subdomínio automático.",
        retryable: true,
        internal: { provider: "cloudflare", cause: error },
      });
    }

    const domain = await this.prisma.domain.upsert({
      where: { hostname },
      create: { projectId, hostname, isSubdomain: true, verified: true },
      update: {},
    });

    await this.prisma.certificate.upsert({
      where: { id: domain.id }, // simplificação: 1 certificado "lógico" por domínio nesta fase
      create: { id: domain.id, domainId: domain.id, issuer: "cloudflare", status: "active", issuedAt: new Date() },
      update: { status: "active" },
    }).catch(async () => {
      // upsert por id só funciona se já existir com esse id — na primeira vez cai aqui.
      const existing = await this.prisma.certificate.findFirst({ where: { domainId: domain.id } });
      if (!existing) {
        await this.prisma.certificate.create({
          data: { domainId: domain.id, issuer: "cloudflare", status: "active", issuedAt: new Date() },
        });
      }
    });

    return domain;
  }

  async addCustomDomain(userId: string, projectId: string, hostname: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundException("Projecto não encontrado.");
    }

    const token = randomBytes(16).toString("hex");
    const targetHostname = buildSubdomainHostname(project.slug, BASE_DOMAIN);

    const domain = await this.prisma.domain.create({
      data: { projectId, hostname, isSubdomain: false, verified: false },
    });

    await this.prisma.domainVerification.create({
      data: { domainId: domain.id, method: "TXT", token },
    });

    return {
      domain,
      instructions: [
        {
          type: "TXT" as const,
          name: `_kixihost-verify.${hostname}`,
          value: token,
        },
        {
          type: "CNAME" as const,
          name: hostname,
          value: targetHostname,
        },
      ],
    };
  }

  async verifyDomain(userId: string, domainId: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
      include: { project: true, verifications: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!domain || domain.project.userId !== userId) {
      throw new NotFoundException("Domínio não encontrado.");
    }

    const verification = domain.verifications[0];
    if (!verification) {
      throw new KixiError({
        code: "KIXI_DOMAIN_DNS_ERROR",
        title: "Verificação não encontrada",
        message: "Não há um pedido de verificação pendente para este domínio.",
        retryable: false,
      });
    }

    const targetHostname = buildSubdomainHostname(domain.project.slug, BASE_DOMAIN);
    const [txtOk, cnameOk] = await Promise.all([
      verifyTxtRecord(domain.hostname, verification.token),
      verifyCnameRecord(domain.hostname, targetHostname),
    ]);

    if (!txtOk || !cnameOk) {
      return {
        verified: false,
        txtOk,
        cnameOk,
        message: !txtOk
          ? "O registo TXT de verificação ainda não foi encontrado."
          : "O registo CNAME ainda não aponta para o subdomínio do projecto.",
      };
    }

    await this.prisma.domainVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });
    await this.prisma.domain.update({ where: { id: domain.id }, data: { verified: true } });

    // Regista o domínio para SSL automático via Cloudflare for SaaS.
    // NOTA HONESTA: isto exige o produto "Cloudflare for SaaS" activo
    // na zona kixihost.ao. Se não estiver, a chamada falha com erro
    // explícito do Cloudflare, propagado como KIXI_SSL_PROVISION_FAILED
    // — nunca falhamos silenciosamente nem fingimos sucesso.
    try {
      const customHostname = await this.cloudflare.createCustomHostname(domain.hostname);
      await this.prisma.certificate.create({
        data: {
          domainId: domain.id,
          issuer: "cloudflare",
          status: customHostname.status === "active" ? "active" : "pending",
        },
      });
    } catch (error) {
      throw new KixiError({
        code: "KIXI_SSL_PROVISION_FAILED",
        title: "Domínio verificado, mas o SSL falhou",
        message: "O domínio foi verificado, mas não foi possível provisionar o certificado SSL automaticamente.",
        action: "A nossa equipa foi notificada. Tenta novamente dentro de alguns minutos.",
        retryable: true,
        internal: { provider: "cloudflare", cause: error },
      });
    }

    return { verified: true, txtOk: true, cnameOk: true };
  }

  async listByProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundException("Projecto não encontrado.");
    }
    return this.prisma.domain.findMany({
      where: { projectId },
      include: { certificates: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
