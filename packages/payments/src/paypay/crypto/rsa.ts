import { privateEncrypt, constants } from "node:crypto";

// Encriptação (não assinatura) do biz_content com a chave privada do
// merchant, exatamente como descrito na documentação oficial PayPay
// (secção 2.3): segmentada em blocos por causa do padding PKCS1,
// usando privateEncrypt (operação de chave pública feita com a chave
// privada — é assim mesmo que a PayPay especifica).

function toPemPrivateKey(base64Key: string): string {
  if (base64Key.includes("-----BEGIN")) return base64Key;
  const wrapped = base64Key.match(/.{1,64}/g)?.join("\n") ?? base64Key;
  return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----`;
}

export function encryptBizContent(plainJson: string, privateKeyBase64: string): string {
  const pem = toPemPrivateKey(privateKeyBase64);
  const keyLenBits = 1024; // exigido pela documentação oficial PayPay
  const blockSize = keyLenBits / 8 - 11;

  const input = Buffer.from(plainJson, "utf-8");
  const chunks: Buffer[] = [];

  for (let offset = 0; offset < input.length; offset += blockSize) {
    const chunk = input.subarray(offset, offset + blockSize);
    const encrypted = privateEncrypt(
      { key: pem, padding: constants.RSA_PKCS1_PADDING },
      chunk,
    );
    chunks.push(encrypted);
  }

  return Buffer.concat(chunks).toString("base64");
}
