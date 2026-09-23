// Regras de período de teste gratuito (ver regra 21).
//
// O período de 21 dias começa preferencialmente quando o primeiro
// deployment do utilizador for concluído com sucesso (status ACTIVE),
// não na data de registo.

export const TRIAL_DAYS = 21;

export function calculateTrialEndDate(firstSuccessfulDeploymentAt: Date): Date {
  const end = new Date(firstSuccessfulDeploymentAt);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}
