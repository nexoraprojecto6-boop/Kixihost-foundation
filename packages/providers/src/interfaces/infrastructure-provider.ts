// Contrato único que toda infraestrutura cloud deve implementar.
//
// Nenhuma parte do sistema fora de packages/providers deve chamar
// SDKs de DigitalOcean/Hetzner/OVH directamente — tudo passa por
// esta interface, seleccionada em runtime pela factory.

export interface CreateServerParams {
  projectId: string;
  region: string;
  size: "small" | "medium" | "large";
  image: string;
}

export interface ProviderServer {
  externalId: string;
  hostname: string;
  ipAddress: string | null;
  status: "provisioning" | "active" | "error";
}

export interface InfrastructureProvider {
  readonly name: "digitalocean" | "hetzner" | "ovh";

  createServer(params: CreateServerParams): Promise<ProviderServer>;
  destroyServer(externalId: string): Promise<void>;
  getServerStatus(externalId: string): Promise<ProviderServer>;
  listRegions(): Promise<string[]>;
}
