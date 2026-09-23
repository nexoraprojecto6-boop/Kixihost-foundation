# apps/api/src/modules

Cada subpasta corresponde a um módulo NestJS futuro:

- `auth/` — GitHub OAuth, sessões, MFA (Fase 2)
- `github/` — GitHub App, webhooks, repositórios (Fase 2)
- `projects/` — CRUD de projectos, detecção de framework (Fase 4)
- `deployments/` — criação de deployments, logs, rollback (Fase 5)
- `domains/` — domínios, DNS, SSL (Fase 7)
- `billing/` — planos, subscrições, wallet (Fase 8)
- `payments/` — checkout, webhooks PayPay/EMIS/Multicaixa (Fase 9)
- `admin/` — endpoints exclusivos do painel administrativo (Fase 11)

Nenhum destes módulos está implementado nesta fase — apenas a estrutura.
