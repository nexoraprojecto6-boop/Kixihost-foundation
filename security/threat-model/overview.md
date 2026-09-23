# Threat Model — Visão Geral (Fundação)

Este documento será expandido na Fase 12 (Security Hardening). Áreas
identificadas desde já como superfícies de ataque prioritárias:

1. Webhooks (GitHub, PayPay, EMIS, Multicaixa) — falsificação de
   assinatura, replay attacks.
2. Execução de código de clientes — fuga de container, esgotamento de
   recursos (CPU/RAM/disco), acesso de rede indevido.
3. Painel administrativo — escalada de privilégio, brute force,
   sessões comprometidas.
4. Pagamentos — duplicação de crédito, comprovativos falsificados,
   reconciliação incorrecta.
5. Domínios/SSL — sequestro de subdomínio, emissão indevida de
   certificados.
