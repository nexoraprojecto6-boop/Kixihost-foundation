// Configuração do adapter PayPay AO.
//
// FONTE OFICIAL (única fonte de verdade para esta integração):
// https://portal.paypayafrica.com/dist/guide/apidoc_pt.html
//
// Não utilizar SDKs de terceiros como base da implementação.
// Todos os campos abaixo devem ser preenchidos a partir de credenciais
// reais fornecidas pela PayPay — nunca inventados.

export interface PayPayConfig {
  apiUrl: string; // PAYPAY_API_URL
  partnerId: string; // PAYPAY_PARTNER_ID
  saleProductCode: string; // PAYPAY_SALE_PRODUCT_CODE
  privateKey: string; // PAYPAY_PRIVATE_KEY — chave RSA privada do merchant, usada para assinar pedidos
  publicKey: string; // PAYPAY_PUBLIC_KEY — chave pública da PayPay, usada para verificar respostas/webhooks
  webhookUrl: string; // PAYPAY_WEBHOOK_URL
}

export function loadPayPayConfigFromEnv(env: NodeJS.ProcessEnv): PayPayConfig {
  const required = (key: string): string => {
    const value = env[key];
    if (!value) {
      throw new Error(`Missing required PayPay env var: ${key}`);
    }
    return value;
  };

  return {
    apiUrl: required("PAYPAY_API_URL"),
    partnerId: required("PAYPAY_PARTNER_ID"),
    saleProductCode: required("PAYPAY_SALE_PRODUCT_CODE"),
    privateKey: required("PAYPAY_PRIVATE_KEY"),
    publicKey: required("PAYPAY_PUBLIC_KEY"),
    webhookUrl: required("PAYPAY_WEBHOOK_URL"),
  };
}
