import { Client } from "ssh2";
import { readFile } from "node:fs/promises";

export interface SshTarget {
  host: string;
  username: string;
  privateKeyPath: string;
}

// Wrapper mínimo sobre ssh2 para correr comandos remotos e copiar
// ficheiros (via exec + cat, sem depender de sftp para o caso simples
// de transferir um único tarball de imagem Docker).
export async function sshExec(target: SshTarget, command: string): Promise<string> {
  const privateKey = await readFile(target.privateKeyPath, "utf-8");

  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = "";

    conn
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }
          stream
            .on("close", (code: number) => {
              conn.end();
              if (code !== 0) {
                reject(new Error(`Comando SSH terminou com código ${code}: ${output}`));
              } else {
                resolve(output);
              }
            })
            .on("data", (data: Buffer) => {
              output += data.toString();
            })
            .stderr.on("data", (data: Buffer) => {
              output += data.toString();
            });
        });
      })
      .on("error", reject)
      .connect({ host: target.host, username: target.username, privateKey, readyTimeout: 20_000 });
  });
}

/** Espera até que o SSH do droplet aceite ligações (após provisionamento). */
export async function waitForSshReady(target: SshTarget, maxAttempts = 20, delayMs = 5000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sshExec(target, "echo ready");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`Timeout à espera que o SSH do servidor ${target.host} ficasse pronto.`);
}
