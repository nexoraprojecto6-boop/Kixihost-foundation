import { z } from "zod";

export const initiatePaymentSchema = z.object({
  amountKz: z.number().int().positive().max(50_000_000),
  provider: z.enum(["paypay", "emis", "multicaixa"]),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export const initiateWalletDepositSchema = z.object({
  amountKz: z.number().int().min(500).max(50_000_000),
});

export type InitiateWalletDepositInput = z.infer<typeof initiateWalletDepositSchema>;
