# Runbook — Resposta a Incidentes (Fundação)

Fluxo alinhado com o Incident Engine (`@kixihost/monitoring`):

1. Detectar (alerta automático ou reporte manual).
2. Criar `Incident` com severidade e descrição.
3. Identificar impacto (quais projectos/utilizadores afectados).
4. Remover servidor não saudável do pool, se aplicável.
5. Tentar recuperação automática.
6. Provisionar substituto quando possível.
7. Restaurar aplicação, correr health checks, reencaminhar tráfego.
8. Resolver o incidente e comunicar aos utilizadores afectados
   (ver regra 35 — nunca culpar o cliente por falha de infraestrutura).

Falhas graves do provider podem exigir intervenção manual — não assumir
recuperação totalmente automática.
