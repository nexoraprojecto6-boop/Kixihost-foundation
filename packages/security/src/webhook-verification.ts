// Verificação genérica de assinatura HMAC para webhooks (GitHub,
// pagamentos). Cada provider tem o seu próprio verifier concreto
// (ver packages/github e packages/payments), mas todos partilham este
// primitivo.

import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyHmacSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  algorithm: "sha256" = "sha256",
): boolean {
  const expected = createHmac(algorithm, secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signatureHeader.replace(/^sha256=/, ""));
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}
