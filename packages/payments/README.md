# @kixihost/payments

Adapters de meios de pagamento (PayPay AO, EMIS, Multicaixa) e
infraestrutura de reconciliação/idempotência para o wallet do KixiHost.

## Regra crítica

Nenhum saldo é creditado com base em comprovativos manuais (screenshots,
SMS, mensagens de suporte). Apenas uma confirmação oficial e verificável
do provider (webhook assinado ou consulta à API oficial) pode credibilizar
uma `WalletTransaction`. Ver `docs/billing/payment-verification.md`.

## PayPay AO

Fonte oficial única: https://portal.paypayafrica.com/dist/guide/apidoc_pt.html

Não usar SDKs de terceiros. Todo campo/endpoint ainda não confirmado
contra a documentação oficial está marcado com `TODO` no código —
nunca inventado.
