// Declaração mínima de tipos para o pacote "tar", para não depender
// de @types/tar (que pode ficar desalinhado com a versão instalada).
declare module "tar" {
  export function extract(options: { file: string; cwd?: string; strip?: number }): Promise<void>;
}
