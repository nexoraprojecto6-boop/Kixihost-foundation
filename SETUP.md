# SETUP

> Este guia cobre a configuração **opcional** de desenvolvimento local.
> Nada aqui é necessário para a produção do KixiHost, que corre
> inteiramente na cloud via GitHub Actions.

## Pré-requisitos

- Node.js ≥ 20
- pnpm ≥ 9 (`corepack enable`)
- Docker (apenas se quiser correr PostgreSQL/Redis localmente)

## 1. Instalar dependências

```bash
pnpm install
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha os valores reais apenas no seu `.env` local — nunca commitar
este ficheiro. Para gerar secrets aleatórios de desenvolvimento:

```bash
bash scripts/generate-secrets-template.sh
```

## 3. (Opcional) Serviços locais

Se quiser correr PostgreSQL/Redis localmente para desenvolvimento:

```bash
docker compose up -d postgres redis
pnpm db:generate
pnpm db:migrate
```

## 4. Verificação estática da fundação

```bash
bash scripts/setup-check.sh
```

## 5. Desenvolvimento

```bash
pnpm dev
```

## GitHub

- **GitHub OAuth** — login do utilizador (`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`).
- **GitHub App** — autorização de repositórios e deployment
  (`GITHUB_APP_ID`/`GITHUB_PRIVATE_KEY`/`GITHUB_WEBHOOK_SECRET`).

## PayPay

Usar exclusivamente a documentação oficial:
https://portal.paypayafrica.com/dist/guide/apidoc_pt.html

## Produção

Feita exclusivamente via `.github/workflows/deploy.yml`, accionado por
push/merge em `main`. Ver `docs/operations/` e `security/` para
detalhes operacionais e de segurança.
