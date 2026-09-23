# Pipeline de Deployment

```
GitHub Push → Webhook → KixiHost API → Criar Deployment → Queue →
Worker → Obter código → Instalar dependências → Build → Testes →
Criar versão → Container → Health Check → Traffic Switch → Monitorização
```

Estados: QUEUED, BUILDING, BUILT, DEPLOYING, HEALTH_CHECK, ACTIVE,
FAILED, ROLLED_BACK, CANCELLED (ver `packages/deployments`).

Se um novo deployment falhar, a versão anterior activa NUNCA é
derrubada automaticamente. Rollback é sempre possível e explícito.
