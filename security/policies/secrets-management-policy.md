# Política de Gestão de Secrets

- Nenhum secret real é commitado no GitHub. Apenas `.env.example` com
  placeholders.
- Em produção, secrets vivem em GitHub Actions Secrets e/ou num Secret
  Manager dedicado.
- Rotação periódica de credenciais (GitHub App private key, tokens de
  provider, chaves PayPay) deve ser documentada em
  `docs/operations/credential-rotation.md` (Fase 12).
- Logs nunca contêm secrets em texto — ver `packages/shared/src/redaction.ts`
  e `packages/logging`.
