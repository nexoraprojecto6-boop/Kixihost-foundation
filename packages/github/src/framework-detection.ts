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

export interface FrameworkDetectionResult {
  framework: DetectedFramework;
  buildCommand: string | null;
  outputDirectory: string | null;
}

function hasDependency(packageJson: Record<string, unknown> | undefined, name: string): boolean {
  if (!packageJson) return false;
  const deps = packageJson["dependencies"] as Record<string, string> | undefined;
  const devDeps = packageJson["devDependencies"] as Record<string, string> | undefined;
  return Boolean(deps?.[name] || devDeps?.[name]);
}

// Heurísticas por ordem de especificidade: frameworks mais específicos
// são verificados antes de fallbacks genéricos (ex.: Next.js antes de
// "react" genérico, já que Next.js também depende de react).
export function detectFramework(input: FrameworkDetectionInput): FrameworkDetectionResult {
  const { packageJson, fileList } = input;

  if (
    hasDependency(packageJson, "next") ||
    fileList.some((f) => /^next\.config\.(js|mjs|ts)$/.test(f))
  ) {
    return { framework: "nextjs", buildCommand: "next build", outputDirectory: ".next" };
  }

  if (hasDependency(packageJson, "@nestjs/core")) {
    return { framework: "nestjs", buildCommand: "nest build", outputDirectory: "dist" };
  }

  if (fileList.some((f) => /^vite\.config\.(js|mjs|ts)$/.test(f))) {
    return { framework: "vite", buildCommand: "vite build", outputDirectory: "dist" };
  }

  if (hasDependency(packageJson, "react") && !hasDependency(packageJson, "next")) {
    return { framework: "react", buildCommand: "npm run build", outputDirectory: "build" };
  }

  if (packageJson) {
    return { framework: "node", buildCommand: null, outputDirectory: null };
  }

  if (fileList.some((f) => /\.(html)$/i.test(f)) && !packageJson) {
    return { framework: "static", buildCommand: null, outputDirectory: "." };
  }

  return { framework: "unknown", buildCommand: null, outputDirectory: null };
}
