// Formata mensagens de erro de deployment para o utilizador final,
// no estilo definido na regra 14: claro, sem jargão de infraestrutura,
// com sugestão de acção.

export interface DeploymentUserFacingError {
  emoji: string;
  title: string;
  description: string;
  suggestion?: string;
}

export function formatMemoryLimitError(usedGb: number, limitGb: number): DeploymentUserFacingError {
  return {
    emoji: "🔴",
    title: "Deployment falhou",
    description: `A aplicação não conseguiu iniciar porque ultrapassou o limite de memória.\n\nMemória utilizada: ${usedGb.toFixed(2)} GB\nLimite: ${limitGb} GB`,
    suggestion: "Reduza o consumo de memória ou actualize o plano.",
  };
}
