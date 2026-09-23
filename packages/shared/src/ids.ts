// Geração de referências internas (ex.: KixiHost Payment Reference).
// Implementação real usa uma lib de IDs (ex. cuid2/ulid) — fundação
// define apenas o contrato.

export function generateKixiReference(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
