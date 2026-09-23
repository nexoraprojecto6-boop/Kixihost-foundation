// Detecção automática de framework a partir dos ficheiros do
// repositório (ver fluxo de onboarding, regra 11).

export type DetectedFramework =
  | "nextjs"
  | "react"
  | "vite"
  | "node"
  | "nestjs"
  | "static"
  | "unknown";

export interface FrameworkDetectionInput {
  packageJson?: Record<string, unknown>;
  fileList: string[];
}

// TODO(Fase 4): implementar heurísticas reais (dependências em
// package.json, presença de next.config.js, vite.config.ts, etc.).
export function detectFramework(_input: FrameworkDetectionInput): DetectedFramework {
  throw new Error("detectFramework: not yet implemented (Fase 4)");
}
