// Redaction/sanitization utilities.
//
// Usado antes de persistir ou apresentar qualquer log ao utilizador,
// para garantir que nunca vazam segredos (ver regra 14 do prompt mestre).

const SENSITIVE_KEY_PATTERN =
  /(password|token|secret|api[_-]?key|private[_-]?key|cookie|database_url|authorization)/i;

const SENSITIVE_VALUE_PATTERNS: RegExp[] = [
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+ PRIVATE KEY-----/g,
  /postgresql:\/\/[^\s]+/g,
  /redis:\/\/[^\s]+/g,
];

/** Redige valores de um objecto cujas chaves parecem sensíveis. */
export function redactObject<T extends Record<string, unknown>>(input: T): T {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      output[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = redactObject(value as Record<string, unknown>);
    } else {
      output[key] = value;
    }
  }
  return output as T;
}

/** Redige padrões sensíveis conhecidos dentro de uma string de log livre. */
export function redactString(input: string): string {
  let output = input;
  for (const pattern of SENSITIVE_VALUE_PATTERNS) {
    output = output.replace(pattern, "[REDACTED]");
  }
  return output;
}
