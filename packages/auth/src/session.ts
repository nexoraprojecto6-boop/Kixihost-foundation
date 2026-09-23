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
