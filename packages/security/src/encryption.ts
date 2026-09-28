import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

export interface EncryptionService {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
}

// AES-256-GCM real. ENCRYPTION_KEY do .env pode ter qualquer tamanho —
// é normalizado para 32 bytes via SHA-256, para nunca rejeitar uma
// chave só por comprimento. Formato do resultado:
// base64(iv) + "." + base64(authTag) + "." + base64(ciphertext).
export class AesGcmEncryptionService implements EncryptionService {
  private readonly key: Buffer;

  constructor(rawKey: string) {
    if (!rawKey) {
      throw new Error("ENCRYPTION_KEY não está definida — obrigatória para encriptar dados sensíveis.");
    }
    this.key = createHash("sha256").update(rawKey).digest();
  }

  async encrypt(plaintext: string): Promise<string> {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    const [ivB64, authTagB64, dataB64] = ciphertext.split(".");
    if (!ivB64 || !authTagB64 || !dataB64) {
      throw new Error("Formato de ciphertext inválido.");
    }
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf-8");
  }
}

/** Singleton simples para uso directo nos serviços — evita recriar a chave normalizada a cada chamada. */
let instance: AesGcmEncryptionService | undefined;
export function getEncryptionService(): AesGcmEncryptionService {
  if (!instance) {
    instance = new AesGcmEncryptionService(process.env.ENCRYPTION_KEY ?? "");
  }
  return instance;
}
