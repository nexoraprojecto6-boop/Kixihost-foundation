# infrastructure/cloudflare

Configuração de DNS, CDN, WAF, protecção DDoS e SSL via Cloudflare
(ver regra 20).

Regras:

- Tokens Cloudflare (`CLOUDFLARE_API_TOKEN`) nunca são expostos ao
  frontend — todas as chamadas à API Cloudflare acontecem no
  Control Plane (api/worker).
- `packages/domains` consome esta camada através de `SslService` e
  `DomainService`, nunca directamente.

## Ficheiros previstos (Fase 7 / Fase 13)

- `dns-records.tf` — registos DNS geridos via Terraform.
- `waf-rules.json` — regras de WAF específicas do KixiHost.
- `zone-settings.tf` — configurações de zona (SSL mode, always-use-https).
