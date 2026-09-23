#!/usr/bin/env bash
# Gera valores aleatórios de exemplo para secrets locais de
# desenvolvimento (SESSION_SECRET, ENCRYPTION_KEY). NUNCA usar os
# valores gerados por este script em produção — em produção, os
# secrets vêm do Secret Manager / GitHub Actions Secrets.
set -euo pipefail

echo "SESSION_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "AUDIT_LOG_SECRET=$(openssl rand -hex 32)"
