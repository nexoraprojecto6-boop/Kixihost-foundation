import { createSign, createPrivateKey } from "node:crypto";

// Gera o texto original da assinatura e assina com SHA1withRSA,
// exatamente como a documentação oficial PayPay especifica (secção 2.4).

export function buildSignOriText(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params)
    .filter(([key, value]) => {
      const lowerKey = key.toLowerCase();
      return value !== undefined && value !== "" && lowerKey !== "sign" && lowerKey !== "sign_type";
    })
    .map(([key, value]) => [key, value as string] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return entries.map(([key, value]) => `${key}=${value}`).join("&");
}

function toPemPrivateKey(base64Key: string): string {
  if (base64Key.includes("-----BEGIN")) return base64Key;
  const wrapped = base64Key.match(/.{1,64}/g)?.join("\n") ?? base64Key;
  return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----`;
}

export function signText(text: string, privateKeyBase64: string): string {
  const pem = toPemPrivateKey(privateKeyBase64);
  const keyObject = createPrivateKey(pem);
  const signer = createSign("SHA1");
  signer.update(text, "utf-8");
  return signer.sign(keyObject).toString("base64");
}
