import { z } from "zod";

export const addCustomDomainSchema = z.object({
  hostname: z
    .string()
    .min(4)
    .max(253)
    .regex(/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i, "Domínio inválido"),
});

export type AddCustomDomainInput = z.infer<typeof addCustomDomainSchema>;
