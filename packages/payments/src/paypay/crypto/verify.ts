import { createVerify, createPublicKey } from "node:crypto";

// Verifica assinaturas de respostas/webhooks da PayPay usando a chave
// PÚBLICA da PayPay (nunca a nossa própria), conforme a documentação
// oficial (secção 3.8.1.3 — Notificações Assíncronas).

function toPemPublicKey(base64Key: string): string {
  if (base64Key.includes("-----BEGIN")) return base64Key;
  const wrapped = base64Key.match(/.{1,64}/g)?.join("\n") ?? base64Key;
  return `-----BEGIN PUBLIC KEY-----\n${wrapped}\n-----END PUBLIC KEY-----`;
}

export function verifySignature(orgText: string, signBase64: string, publicKeyBase64: string): boolean {
  try {
    const pem = toPemPublicKey(publicKeyBase64);
    const keyObject = createPublicKey(pem);
    const verifier = createVerify("SHA1");
    verifier.update(orgText, "utf-8");
    return verifier.verify(keyObject, Buffer.from(signBase64, "base64"));
  } catch {
    return false;
  }
}
