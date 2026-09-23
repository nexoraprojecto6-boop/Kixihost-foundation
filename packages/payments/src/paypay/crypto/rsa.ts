// Wrapper mínimo sobre operações RSA (assinatura/verificação) usadas na
// integração PayPay, conforme o modelo de assinatura descrito na
// documentação oficial: https://portal.paypayafrica.com/dist/guide/apidoc_pt.html
//
// TODO(Fase 9): confirmar algoritmo exacto exigido (ex.: RSA2/SHA256)
// e o formato de encoding (base64) na documentação oficial antes de
// implementar. Não inventar o algoritmo.

export interface RsaKeyPairPem {
  privateKeyPem: string;
  publicKeyPem: string;
}
