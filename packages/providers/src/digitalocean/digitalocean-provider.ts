import type {
  CreateServerParams,
  InfrastructureProvider,
  ProviderServer,
} from "../interfaces/infrastructure-provider";
import { mapProviderError } from "../errors/error-mapper";

// Implementação real via API pública do DigitalOcean v2
// (https://docs.digitalocean.com/reference/api/). Nenhum SDK de
// terceiros — chamadas HTTP directas, mantendo o contrato
// InfrastructureProvider como única superfície exposta ao resto do
// sistema.

const DO_API_BASE = "https://api.digitalocean.com/v2";

const SIZE_SLUGS: Record<CreateServerParams["size"], string> = {
  small: "s-1vcpu-1gb",
  medium: "s-2vcpu-2gb",
  large: "s-4vcpu-8gb",
};

// Imagem oficial do marketplace DigitalOcean com Docker pré-instalado.
const DOCKER_IMAGE_SLUG = "docker-20-04";

interface DODropletResponse {
  droplet: {
    id: number;
    name: string;
    status: "new" | "active" | "off" | "archive";
    networks: { v4: Array<{ ip_address: string; type: string }> };
  };
}

export class DigitalOceanProvider implements InfrastructureProvider {
  readonly name = "digitalocean" as const;

  constructor(
    private readonly apiToken: string,
    private readonly sshKeyId: string,
  ) {}

  private async request(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${DO_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  }

  async createServer(params: CreateServerParams): Promise<ProviderServer> {
    const response = await this.request("/droplets", {
      method: "POST",
      body: JSON.stringify({
        name: `kixihost-${params.projectId}`,
        region: params.region,
        size: SIZE_SLUGS[params.size],
        image: DOCKER_IMAGE_SLUG,
        ssh_keys: [this.sshKeyId],
        user_data: params.image, // aqui reaproveitamos o campo `image` do contrato para passar o cloud-init (ver nota abaixo)
        tags: ["kixihost", `project:${params.projectId}`],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw mapProviderError({
        provider: "digitalocean",
        httpStatus: response.status,
        providerMessage: body,
      });
    }

    const data = (await response.json()) as DODropletResponse;
    return {
      externalId: String(data.droplet.id),
      hostname: data.droplet.name,
      ipAddress: null, // ainda a provisionar — usar getServerStatus para obter o IP
      status: "provisioning",
    };
  }

  async destroyServer(externalId: string): Promise<void> {
    const response = await this.request(`/droplets/${externalId}`, { method: "DELETE" });
    if (!response.ok && response.status !== 404) {
      const body = await response.text().catch(() => "");
      throw mapProviderError({ provider: "digitalocean", httpStatus: response.status, providerMessage: body });
    }
  }

  async getServerStatus(externalId: string): Promise<ProviderServer> {
    const response = await this.request(`/droplets/${externalId}`);
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw mapProviderError({ provider: "digitalocean", httpStatus: response.status, providerMessage: body });
    }

    const data = (await response.json()) as DODropletResponse;
    const publicIp = data.droplet.networks.v4.find((n) => n.type === "public")?.ip_address ?? null;

    return {
      externalId: String(data.droplet.id),
      hostname: data.droplet.name,
      ipAddress: publicIp,
      status: data.droplet.status === "active" ? "active" : "provisioning",
    };
  }

  async listRegions(): Promise<string[]> {
    const response = await this.request("/regions");
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw mapProviderError({ provider: "digitalocean", httpStatus: response.status, providerMessage: body });
    }
    const data = (await response.json()) as { regions: Array<{ slug: string; available: boolean }> };
    return data.regions.filter((r) => r.available).map((r) => r.slug);
  }
}
