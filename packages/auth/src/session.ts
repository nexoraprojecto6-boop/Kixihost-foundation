import jwt from "jsonwebtoken";

export interface SessionPayload {
  userId: string;
  sessionId: string;
  mfaVerified: boolean;
}

export interface SessionService {
  create(userId: string, ipAddress?: string, userAgent?: string): Promise<string>;
  verify(sessionToken: string): Promise<SessionPayload | null>;
  revoke(sessionId: string): Promise<void>;
}

// Implementação com JWT assinado (SESSION_SECRET) + registo em Session
// (base de dados) para permitir revogação. O token em si nunca é
// persistido — apenas o sessionId e metadados.
export class JwtSessionService implements SessionService {
  constructor(
    private readonly sessionSecret: string,
    private readonly persistSession: (
      userId: string,
      sessionId: string,
      expiresAt: Date,
      ipAddress?: string,
      userAgent?: string,
    ) => Promise<void>,
    private readonly isSessionRevoked: (sessionId: string) => Promise<boolean>,
    private readonly deleteSession: (sessionId: string) => Promise<void>,
    private readonly ttlSeconds: number = 60 * 60 * 24 * 30, // 30 dias
  ) {}

  async create(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);

    await this.persistSession(userId, sessionId, expiresAt, ipAddress, userAgent);

    const payload: SessionPayload = { userId, sessionId, mfaVerified: false };
    return jwt.sign(payload, this.sessionSecret, { expiresIn: this.ttlSeconds });
  }

  async verify(sessionToken: string): Promise<SessionPayload | null> {
    try {
      const payload = jwt.verify(sessionToken, this.sessionSecret) as SessionPayload;
      const revoked = await this.isSessionRevoked(payload.sessionId);
      if (revoked) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async revoke(sessionId: string): Promise<void> {
    await this.deleteSession(sessionId);
  }
}
