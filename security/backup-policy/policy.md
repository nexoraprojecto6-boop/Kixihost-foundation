# Política de Backups

- Backups diários do PostgreSQL de produção, com retenção mínima a
  definir na Fase 13.
- Backups armazenados externamente (fora do provider principal), para
  resiliência a falhas do provider.
- Testes de restauração periódicos e documentados — um backup nunca é
  considerado suficiente sem teste de restauração comprovado
  (ver regra 40).
