// Wrapper fino sobre a API pública do Cloudflare (v4), documentada em
// https://developers.cloudflare.com/api/. Nenhum SDK de terceiros —
// chamadas HTTP directas, mantendo esta classe como única superfície
// de acesso ao Cloudflare no resto do sistema.

export interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  /** Domínio apex da zona, ex.: "kixihost.ao". */
  zoneName: string;
}

interface CloudflareApiResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  result: T;
}

export type DnsRecordType = "A" | "CNAME" | "TXT";

export interface UpsertDnsRecordParams {
  type: DnsRecordType;
  name: string; // FQDN completo, ex.: "meu-projeto.kixihost.ao"
  content: string;
  proxied?: boolean;
}

export class CloudflareClient {
  constructor(private readonly config: CloudflareConfig) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    const data = (await response.json()) as CloudflareApiResponse<T>;

    if (!response.ok || !data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors ?? [])}`);
    }

    return data.result;
  }

  async upsertDnsRecord(params: UpsertDnsRecordParams): Promise<{ id: string }> {
    const existing = await this.request<Array<{ id: string }>>(
      `/zones/${this.config.zoneId}/dns_records?type=${params.type}&name=${encodeURIComponent(params.name)}`,
    );

    const body = JSON.stringify({
      type: params.type,
      name: params.name,
      content: params.content,
      proxied: params.proxied ?? false,
      ttl: 1, // "automatic"
    });

        const existingRecord = existing[0];
    if (existingRecord) {
      return this.request(`/zones/${this.config.zoneId}/dns_records/${existingRecord.id}`, {
        method: "PUT",
        body,
      });
    }

    return this.request(`/zones/${this.config.zoneId}/dns_records`, { method: "POST", body });
  }

  async deleteDnsRecordByName(type: DnsRecordType, name: string): Promise<void> {
    const existing = await this.request<Array<{ id: string }>>(
      `/zones/${this.config.zoneId}/dns_records?type=${type}&name=${encodeURIComponent(name)}`,
    );
    for (const record of existing) {
      await this.request(`/zones/${this.config.zoneId}/dns_records/${record.id}`, { method: "DELETE" });
    }
  }

  /**
   * Regista um domínio de cliente para SSL automático via Cloudflare
   * for SaaS (Custom Hostnames). Requer esse produto activado na zona
   * — se não estiver, a API devolve erro explícito, que propagamos
   * como KixiError através do error mapper do domínio.
   */
  async createCustomHostname(hostname: string): Promise<{ id: string; status: string }> {
    return this.request(`/zones/${this.config.zoneId}/custom_hostnames`, {
      method: "POST",
      body: JSON.stringify({ hostname, ssl: { method: "http", type: "dv" } }),
    });
  }

  async getCustomHostnameStatus(customHostnameId: string): Promise<{
    id: string;
    status: string;
    ssl: { status: string };
  }> {
    return this.request(`/zones/${this.config.zoneId}/custom_hostnames/${customHostnameId}`);
  }
}
