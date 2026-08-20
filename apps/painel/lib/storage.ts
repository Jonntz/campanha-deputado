import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Armazenamento dos arquivos de mídia.
 *
 * Existe como interface por dois motivos concretos: em desenvolvimento não há
 * token do Blob, e os vídeos da campanha (4 a 16 MB) provavelmente vão migrar
 * para o R2 quando o tráfego de saída começar a pesar. Trocar de provedor é
 * trocar um arquivo, não caçar chamadas espalhadas.
 */
export type StoredFile = { url: string; pathname: string };

export interface MediaStorage {
  readonly name: string;
  put(key: string, body: Buffer, contentType: string): Promise<StoredFile>;
  remove(pathname: string): Promise<void>;
}

/**
 * Grava em `apps/site/public/uploads/`. Só desenvolvimento: o sistema de
 * arquivos das funções da Vercel é somente-leitura, então isto falharia em
 * produção — de propósito, para não passar despercebido.
 */
class LocalStorage implements MediaStorage {
  readonly name = "local";

  private root = path.resolve(
    process.cwd(),
    "../../apps/site/public/uploads",
  );

  async put(key: string, body: Buffer): Promise<StoredFile> {
    const target = path.join(this.root, key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, body);
    return { url: `/uploads/${key}`, pathname: key };
  }

  async remove(pathname: string): Promise<void> {
    await unlink(path.join(this.root, pathname)).catch(() => {});
  }
}

class BlobStorage implements MediaStorage {
  readonly name = "vercel-blob";

  async put(key: string, body: Buffer, contentType: string): Promise<StoredFile> {
    const { put } = await import("@vercel/blob");
    const result = await put(key, body, {
      access: "public",
      contentType,
      // O nome já carrega o hash do conteúdo, então um sufixo aleatório só
      // atrapalharia a deduplicação.
      addRandomSuffix: false,
    });
    return { url: result.url, pathname: result.pathname };
  }

  async remove(pathname: string): Promise<void> {
    const { del } = await import("@vercel/blob");
    await del(pathname);
  }
}

let cached: MediaStorage | null = null;

export function getStorage(): MediaStorage {
  if (cached) return cached;
  cached = process.env.BLOB_READ_WRITE_TOKEN
    ? new BlobStorage()
    : new LocalStorage();
  return cached;
}
