# KixiHost

Plataforma de cloud hosting/deployment voltada principalmente para
Angola, permitindo hospedar e publicar aplicações e websites
directamente a partir do GitHub.

> Este repositório contém a **fundação** do produto: estrutura,
> configurações, interfaces, schemas e documentação. A implementação
> funcional acontece por fases — ver `docs/` e a secção
> [Fases de implementação](#fases-de-implementação) abaixo.

## Visão

O utilizador entra com GitHub, autoriza os seus repositórios via
GitHub App, cria um projecto, faz deploy e recebe um subdomínio
`*.kixihost.ao` — podendo depois ligar um domínio próprio com
HTTPS/SSL automático, ver logs, deployments, fazer rollback, gerir
plano/saldo e pagar através de métodos de pagamento suportados
(PayPay AO, EMIS, Multicaixa).

## Arquitectura

```
Internet → Cloudflare (DNS/WAF/CDN) → KixiHost Web / API → Worker →
PostgreSQL + Redis → Infraestrutura Cloud (DigitalOcean → Hetzner/OVH)
```

Control Plane (auth, projectos, billing, pagamentos, domínios,
administração) e Data Plane (execução isolada do código dos clientes)
são estritamente separados — ver `docs/architecture/control-plane-data-plane.md`.

## Estrutura

```
kixihost/
├── apps/            web, api, worker, admin
├── packages/        database, auth, security, providers, deployments,
│                    billing, payments, logging, monitoring, domains,
│                    github, notifications, validation, shared, ui,
│                    i18n, config
├── infrastructure/  docker, terraform, cloudflare, monitoring
├── security/        policies, threat-model, incident-response,
│                    backup-policy, disaster-recovery
├── docs/
├── scripts/
├── tests/           integration, e2e, security, load
└── .github/workflows/
```

## Tecnologias

- **Frontend:** Next.js, TypeScript, React, Tailwind CSS
- **Backend:** NestJS, Node.js, TypeScript
- **Base de dados:** PostgreSQL + Prisma
- **Queue:** Redis/Valkey + BullMQ
- **Infra:** Docker, Terraform/OpenTofu, Cloudflare
- **CI/CD:** GitHub Actions
- **GitHub:** OAuth (login) + GitHub App (autorização de repos) + Webhooks
- **Observabilidade:** OpenTelemetry, Prometheus, Grafana
- **Testes:** Vitest/Jest, Playwright, testes de integração/E2E/segurança
- **Validação:** Zod

## Regras de desenvolvimento

- **GitHub Dashboard** é o principal ambiente de edição de código.
- **Terminal (VS Code)** serve apenas para instalação, actualização,
  manutenção e diagnóstico — nunca para manter a produção a funcionar.
- **GitHub é a fonte de verdade.** GitHub Actions faz CI/CD.
- **Produção é 100% cloud.** O computador local nunca é dependência de
  produção.
- **PayPay AO** usa exclusivamente a documentação oficial:
  https://portal.paypayafrica.com/dist/guide/apidoc_pt.html
- **Pagamentos** só creditam saldo através de confirmação oficial
  verificável (webhook/API) — nunca comprovativos manuais.
- **Secrets** nunca ficam no código — apenas `.env.example` com placeholders.
- **Código de clientes** corre isolado do Control Plane.

## Fases de implementação

1. Foundation (este repositório)
2. Authentication + GitHub
3. Database
4. Projects
5. Deployments
6. Infrastructure Providers
7. Domains + SSL
8. Billing + Wallet
9. PayPay
10. Monitoring
11. Admin
12. Security hardening
13. Production deployment

Ver `SETUP.md` para instruções de configuração local (desenvolvimento
opcional) e `docs/` para a documentação detalhada por área.

## Licença

Proprietário — ver `LICENSE`.
