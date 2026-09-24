export function buildSubdomainHostname(slug: string, baseDomain: string): string {
  return `${slug}.${baseDomain}`;
}
