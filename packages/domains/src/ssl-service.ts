// Provisionamento e renovação de certificados SSL (via Cloudflare —
// ver infrastructure/cloudflare).

export interface SslService {
  provisionCertificate(domainId: string): Promise<{ status: "pending" | "active" | "failed" }>;
  renewCertificate(domainId: string): Promise<void>;
  getCertificateStatus(domainId: string): Promise<{ status: string; expiresAt?: Date }>;
}
