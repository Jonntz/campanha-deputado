/**
 * Move para o Vercel Blob as mídias que ficaram gravadas em disco local.
 *
 * Sem `BLOB_READ_WRITE_TOKEN`, o painel grava em `apps/site/public/uploads/` —
 * o que funciona em desenvolvimento e **quebra em produção**, porque a pasta é
 * ignorada pelo Git e o sistema de arquivos das funções é somente-leitura. Uma
 * imagem enviada nessas condições vira URL morta assim que o site sobe.
 *
 * Uso:
 *   pnpm --filter painel exec tsx --env-file=.env.local \
 *     scripts/migrar-midias-locais.ts [--dry]
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createDatabase, listLocalMedia, rewriteMediaUrl } from "@campanha/db";
import { put } from "@vercel/blob";

const LOCAL_ROOT = path.resolve(process.cwd(), "../site/public/uploads");

/**
 * Traduz as falhas conhecidas do Blob para instruções acionáveis.
 *
 * A mensagem crua do SDK para um store privado fala em token inválido, o que
 * manda quem lê investigar a credencial — que está certa. O problema é outro.
 */
function explicar(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/private store|private access/i.test(message)) {
    return [
      "O Blob store está configurado como PRIVADO.",
      "",
      "As fotos de um site público precisam ser lidas por qualquer navegador, e",
      "um store privado exige autenticação a cada leitura — o que também anula o",
      "cache do CDN e o otimizador de imagens do Next.",
      "",
      "O modo de acesso não pode ser alterado depois da criação. Crie um novo",
      "store marcando PUBLIC, troque o BLOB_READ_WRITE_TOKEN em",
      "apps/painel/.env.local e rode este script de novo.",
    ].join("\n");
  }

  if (/Access denied|valid token/i.test(message)) {
    return [
      "O Blob recusou o token.",
      "",
      "Confira se o BLOB_READ_WRITE_TOKEN em apps/painel/.env.local pertence ao",
      "store que você pretende usar, e se não foi revogado desde que você copiou.",
    ].join("\n");
  }

  return message;
}

async function main() {
  const dryRun = process.argv.includes("--dry");

  if (!process.env.TURSO_DATABASE_URL) {
    console.error("TURSO_DATABASE_URL ausente.");
    process.exit(1);
  }
  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      "BLOB_READ_WRITE_TOKEN ausente.\n" +
        "Crie o Blob store na Vercel, copie o token para apps/painel/.env.local e rode de novo.\n" +
        "Para apenas listar o que seria migrado, use --dry.",
    );
    process.exit(1);
  }

  const db = createDatabase();
  const pending = await listLocalMedia(db);

  if (pending.length === 0) {
    console.log("Nenhuma mídia em disco local. Nada a fazer.");
    return;
  }

  console.log(`${pending.length} mídia(s) para migrar${dryRun ? " (simulação)" : ""}:\n`);
  let failed = 0;

  for (const item of pending) {
    const file = path.join(LOCAL_ROOT, item.pathname);

    let bytes: Buffer;
    try {
      bytes = await readFile(file);
    } catch {
      // Apagar a linha sozinho seria pior: deixaria a seção apontando para o
      // nada, sem aviso, até alguém abrir a página.
      failed++;
      console.error(`  ✗ ${item.url}`);
      console.error(`     arquivo não encontrado em ${file}`);
      console.error("     reenvie essa imagem pelo painel depois do deploy\n");
      continue;
    }

    console.log(`  ${item.url}  (${Math.round(bytes.byteLength / 1024)} kB)`);

    if (dryRun) {
      console.log("     → seria enviada ao Blob\n");
      continue;
    }

    let uploaded;
    try {
      uploaded = await put(item.pathname, bytes, {
        access: "public",
        contentType: item.mimeType,
        // O nome já carrega o hash do conteúdo; sufixo aleatório atrapalharia a
        // deduplicação de envios futuros.
        addRandomSuffix: false,
      });
    } catch (error) {
      // Falha de configuração atinge todos os arquivos igualmente: insistir nos
      // demais só repetiria o mesmo erro.
      console.error("\n" + explicar(error) + "\n");
      process.exit(1);
    }

    const touched = await rewriteMediaUrl(db, {
      id: item.id,
      oldUrl: item.url,
      newUrl: uploaded.url,
      newPathname: uploaded.pathname,
    });

    console.log(`     → ${uploaded.url}`);
    console.log(`     ${touched} seção(ões) atualizada(s)\n`);
  }

  const left = await listLocalMedia(db);
  if (dryRun) {
    console.log("Simulação concluída — nada foi alterado.");
  } else if (left.length === 0) {
    console.log("Concluído. Publique pelo painel para o site servir as novas URLs.");
  } else {
    console.log(`Concluído com ${failed} pendência(s). Reenvie-as pelo painel.`);
  }
}

// Sem await de topo: este pacote não é ESM, e o tsx transpila para CJS.
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
