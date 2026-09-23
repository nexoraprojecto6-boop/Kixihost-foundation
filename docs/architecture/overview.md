# Arquitectura — Visão Geral

KixiHost segue uma arquitectura Control Plane / Data Plane:

- **Control Plane** — autenticação, utilizadores, GitHub, projectos,
  deployments (orquestração), billing, pagamentos, wallet, domínios,
  logs, monitorização, notificações, administração, segurança.
- **Data Plane** — execução isolada das aplicações dos clientes. Nunca
  partilha processo/host com o Control Plane.

```
Internet → Cloudflare (DNS/WAF/CDN) → KixiHost Web / KixiHost API → Worker → PostgreSQL + Redis → Infraestrutura Cloud (DigitalOcean → Hetzner/OVH no futuro)
```

Ver `docs/architecture/database.md`, `docs/architecture/control-plane-data-plane.md`
e `docs/architecture/monorepo.md` para detalhe.
