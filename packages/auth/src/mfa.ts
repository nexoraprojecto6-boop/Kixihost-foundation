// Multi-factor authentication — obrigatório para acesso administrativo
// (ver regra 32) e disponível opcionalmente para contas de cliente.

export interface MFAService {
  enrollTotp(userId: string): Promise<{ secret: string; otpauthUrl: string }>;
  verifyTotp(userId: string, code: string): Promise<boolean>;
}
