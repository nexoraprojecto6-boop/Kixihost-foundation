// Carregamento e validação central de variáveis de ambiente.
// Cada app (api, worker, web, admin) deve importar daqui em vez de ler
// `process.env` directamente, para garantir validação consistente e
// evitar segredos espalhados pelo código.

export interface AppEnvironment {
  nodeEnv: "development" | "staging" | "production" | "test";
  appUrl: string;
  apiUrl: string;
}

export function loadAppEnvironment(env: NodeJS.ProcessEnv): AppEnvironment {
  return {
    nodeEnv: (env.NODE_ENV as AppEnvironment["nodeEnv"]) ?? "development",
    appUrl: env.APP_URL ?? "http://localhost:3000",
    apiUrl: env.API_URL ?? "http://localhost:4000",
  };
}
