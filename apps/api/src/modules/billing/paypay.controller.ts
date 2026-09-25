import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { PrismaService } from "@kixihost/database";
import { PayPayAdapter, loadPayPayConfigFromEnv, parsePayPayWebhook, processPayPayWebhook } from "@kixihost/payments";
import { verifyPayPayWebhook } from "@kixihost/payments";
import { PrismaWalletService } from "@kixihost/billing";
import { Logger } from "@kixihost/logging";

const logger = new Logger("paypay-webhook");

// Endpoint público (sem SessionGuard) — a PayPay chama isto
// directamente. A segurança vem da verificação de assinatura RSA
// (chave pública da PayPay), nunca de autenticação de sessão.
@Controller("payments/paypay")
export class PayPayController {
  private readonly walletService: PrismaWalletService;

  constructor(private readonly prisma: PrismaService) {
    this.walletService = new PrismaWalletService(prisma);
  }

  @Post("webhook")
  async handleWebhook(@Req() req: Request, @Res() res: Response, @Body() body: Record<string, string>) {
    try {
      const config = loadPayPayConfigFromEnv(process.env);
      const payload = parsePayPayWebhook(body);

      if (!verifyPayPayWebhook(payload, config)) {
        logger.warn("Assinatura de webhook PayPay inválida", { outTradeNo: payload.out_trade_no });
        res.status(400).send("invalid signature");
        return;
      }

      // Idempotência: o mesmo notify_id nunca é processado duas vezes.
      const alreadyProcessed = await this.prisma.webhookEvent.findFirst({
        where: { source: "paypay", payloadHash: payload.notify_id },
      });
      if (alreadyProcessed) {
        res.status(200).send("success");
        return;
      }

      const result = processPayPayWebhook(payload);

      if (result && result.status === "VERIFIED") {
        const payment = await this.prisma.payment.findUnique({
          where: { kixihostRef: result.kixihostReference },
        });

        if (payment && payment.status !== "VERIFIED") {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: "VERIFIED", verifiedAt: new Date(), providerRef: result.providerRef },
          });
          await this.walletService.creditFromVerifiedPayment(payment.userId, payment.id, payment.amountKz);
          logger.info("Pagamento PayPay verificado e saldo creditado", { paymentId: payment.id });
        }
      } else if (result && result.status === "FAILED") {
        await this.prisma.payment.updateMany({
          where: { kixihostRef: result.kixihostReference, status: "PENDING" },
          data: { status: "FAILED" },
        });
      }

      await this.prisma.webhookEvent.create({
        data: { source: "paypay", eventType: payload.status, payloadHash: payload.notify_id, processedAt: new Date() },
      });

      // A documentação oficial exige resposta EXATAMENTE "success", texto puro.
      res.status(200).send("success");
    } catch (error) {
      logger.error("Erro ao processar webhook PayPay", { error: (error as Error).message });
      res.status(500).send("error");
    }
  }
}
