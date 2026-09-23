import { z } from "zod";

// Validação do fluxo de onboarding (ver regra 11).
export const onboardingProfileSchema = z.object({
  fullName: z.string().min(3).max(150),
  phone: z.string().min(9).max(20),
  province: z.string().min(2).max(100),
  municipality: z.string().min(2).max(100),
  address: z.string().min(3).max(255),
  termsAccepted: z.literal(true),
});

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
