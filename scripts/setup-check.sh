#!/usr/bin/env bash
# Verificação estática da fundação — NÃO inicia nenhum serviço.
# Confirma apenas que as ferramentas necessárias estão instaladas e que
# a estrutura de ficheiros essencial existe.
set -euo pipefail

echo "== KixiHost — verificação estática da fundação =="

command -v node >/dev/null 2>&1 && echo "OK: node encontrado ($(node -v))" || echo "AVISO: node não encontrado"
command -v pnpm >/dev/null 2>&1 && echo "OK: pnpm encontrado ($(pnpm -v))" || echo "AVISO: pnpm não encontrado"

for f in package.json pnpm-workspace.yaml turbo.json .env.example; do
  if [ -f "$f" ]; then
    echo "OK: $f presente"
  else
    echo "ERRO: $f em falta"
  fi
done

echo "== Fim da verificação (nenhum serviço foi iniciado) =="
