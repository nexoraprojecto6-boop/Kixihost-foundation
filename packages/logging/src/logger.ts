import { redactObject, redactString } from "@kixihost/shared";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  requestId?: string;
  userId?: string;
  projectId?: string;
  deploymentId?: string;
  [key: string]: unknown;
}

// Logger estruturado com redaction automática. Toda a aplicação deve
// usar este logger em vez de `console.log`, para garantir que segredos
// nunca são persistidos (ver regra 14/38).
export class Logger {
  constructor(private readonly service: string) {}

  private write(level: LogLevel, message: string, fields?: LogFields) {
    const safeFields = fields ? redactObject(fields) : undefined;
    const safeMessage = redactString(message);
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.service,
      level,
      message: safeMessage,
      ...safeFields,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }

  debug(message: string, fields?: LogFields) {
    this.write("debug", message, fields);
  }
  info(message: string, fields?: LogFields) {
    this.write("info", message, fields);
  }
  warn(message: string, fields?: LogFields) {
    this.write("warn", message, fields);
  }
  error(message: string, fields?: LogFields) {
    this.write("error", message, fields);
  }
}
