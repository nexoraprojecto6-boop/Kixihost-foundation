// Verificação de registos DNS via DNS-over-HTTPS (Cloudflare
// 1.1.1.1), usada para confirmar que o cliente já configurou o TXT de
// verificação ou o CNAME do domínio próprio, sem depender de
// resolução DNS local do processo do Worker/API.

interface DohAnswer {
  Status: number;
  Answer?: Array<{ type: number; data: string }>;
}

async function dohQuery(name: string, type: "TXT" | "CNAME"): Promise<string[]> {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { Accept: "application/dns-json" } },
  );

  if (!response.ok) {
    throw new Error(`Consulta DNS falhou: HTTP ${response.status}`);
  }

  const data = (await response.json()) as DohAnswer;
  return (data.Answer ?? []).map((a) => a.data.replace(/^"|"$/g, ""));
}

export async function verifyTxtRecord(hostname: string, expectedValue: string): Promise<boolean> {
  try {
    const values = await dohQuery(`_kixihost-verify.${hostname}`, "TXT");
    return values.includes(expectedValue);
  } catch {
    return false;
  }
}

export async function verifyCnameRecord(hostname: string, expectedTarget: string): Promise<boolean> {
  try {
    const values = await dohQuery(hostname, "CNAME");
    return values.some((v) => v.replace(/\.$/, "") === expectedTarget.replace(/\.$/, ""));
  } catch {
    return false;
  }
}
