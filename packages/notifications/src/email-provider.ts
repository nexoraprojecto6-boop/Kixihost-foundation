// Adapter de envio de email — EMAIL_PROVIDER/EMAIL_API_KEY.
// TODO: implementar contra o provider de email escolhido (ex.: Resend,
// SES, Postmark) quando confirmado.
export interface EmailProvider {
  send(to: string, subject: string, htmlBody: string): Promise<void>;
}
