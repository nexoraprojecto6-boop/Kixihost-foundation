import { z } from "zod";

export const initiatePaymentSchema = z.object({
  amountKz: z.number().int().positive().max(50_000_000),
  provider: z.enum(["paypay", "emis", "multicaixa"]),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
