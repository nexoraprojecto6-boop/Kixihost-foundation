// Protecções gerais de input a aplicar em toda a fronteira da API
// (ver regra 36): SSRF, command injection, path traversal.

export function isSafeOutboundUrl(url: string, allowedHosts: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return allowedHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function isSafeRelativePath(path: string): boolean {
  return !path.includes("..") && !path.startsWith("/") && !path.includes("\0");
}
