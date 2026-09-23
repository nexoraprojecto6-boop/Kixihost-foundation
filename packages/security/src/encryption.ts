// Contrato de encriptação em repouso para dados sensíveis (tokens
// GitHub, variáveis de ambiente de projectos, secrets de MFA, etc.).
// Implementação real (Fase 3) deve usar AES-256-GCM com ENCRYPTION_KEY
// gerida via secret manager, nunca hardcoded.

export interface EncryptionService {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
}
