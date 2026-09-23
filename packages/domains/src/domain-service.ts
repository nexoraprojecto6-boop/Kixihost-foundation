// Gestão de domínios e subdomínios (ver regra 19).
//
// Todo projecto recebe automaticamente `<slug>.kixihost.ao`. O cliente
// pode adicionalmente ligar um domínio próprio (ex.: empresa.ao,
// www.empresa.ao), com verificação DNS antes de activação.

export interface DnsInstruction {
  type: "TXT" | "CNAME" | "A";
  name: string;
  value: string;
}

export interface DomainService {
  assignSubdomain(projectId: string, slug: string): Promise<string>; // ex: "meu-projeto.kixihost.ao"
  addCustomDomain(projectId: string, hostname: string): Promise<{ instructions: DnsInstruction[] }>;
  verifyDomain(domainId: string): Promise<{ verified: boolean }>;
}
