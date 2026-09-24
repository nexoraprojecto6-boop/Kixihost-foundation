import type { InfrastructureProvider } from "../interfaces/infrastructure-provider";
import { DigitalOceanProvider } from "../digitalocean/digitalocean-provider";
import { HetznerProvider } from "../hetzner/hetzner-provider";
import { OVHProvider } from "../ovh/ovh-provider";

export type ProviderName = "digitalocean" | "hetzner" | "ovh";

export interface ProviderFactoryConfig {
  digitalocean?: { apiToken: string; sshKeyId: string };
  hetzner?: { apiToken: string };
  ovh?: {
    endpoint: string;
    applicationKey: string;
    applicationSecret: string;
    consumerKey: string;
  };
}

export class ProviderFactory {
  constructor(private readonly config: ProviderFactoryConfig) {}

  create(name: ProviderName): InfrastructureProvider {
    switch (name) {
      case "digitalocean":
        if (!this.config.digitalocean) {
          throw new Error("DigitalOcean provider not configured");
        }
        return new DigitalOceanProvider(
          this.config.digitalocean.apiToken,
          this.config.digitalocean.sshKeyId,
        );
      case "hetzner":
        if (!this.config.hetzner) {
          throw new Error("Hetzner provider not configured");
        }
        return new HetznerProvider(this.config.hetzner.apiToken);
      case "ovh":
        if (!this.config.ovh) {
          throw new Error("OVH provider not configured");
        }
        return new OVHProvider(
          this.config.ovh.endpoint,
          this.config.ovh.applicationKey,
          this.config.ovh.applicationSecret,
          this.config.ovh.consumerKey,
        );
    }
  }
}
