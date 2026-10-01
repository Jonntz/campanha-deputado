/**
 * Cria no banco a linha da seção "colinha".
 *
 * O site renderiza a seção a partir do conteúdo padrão mesmo sem linha no
 * banco, mas o painel monta a lista de Conteúdo a partir das linhas — sem esta,
 * a seção não aparece para editar.
 *
 * **Rode só depois do deploy.** O site que está no ar lê o mesmo banco, e uma
 * chave de seção que o código dele não conhece derruba a leitura inteira para o
 * conteúdo padrão. Por isso o script confere antes se o site publicado já
 * conhece a colinha, e se recusa a rodar enquanto não conhecer.
 *
 * Uso:
 *   pnpm --filter painel criar-secao-colinha             # mostra o que faria
 *   pnpm --filter painel criar-secao-colinha --aplicar   # cria a linha
 */
import { defaultContent, splitContent } from "@campanha/content";
import { createDatabase, tables } from "@campanha/db";
import { and, eq } from "drizzle-orm";

const KEY = "colinha";
const LOCALE = "pt-BR";

async function siteJaConheceAColinha(): Promise<boolean | null> {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) return null;
  try {
    const response = await fetch(`${siteUrl}/`, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return null;
    return (await response.text()).includes('id="colinha"');
  } catch {
    return null;
  }
}

async function main() {
  const apply = process.argv.includes("--aplicar");
  const db = createDatabase();
  const payload = splitContent(defaultContent).sections.colinha;

  const existing = await db
    .select()
    .from(tables.sections)
    .where(and(eq(tables.sections.locale, LOCALE), eq(tables.sections.key, KEY)))
    .limit(1);

  if (existing[0]) {
    console.log("A linha da colinha já existe no banco. Nada a fazer.");
    return;
  }

  const rows = await db.select().from(tables.sections).where(eq(tables.sections.locale, LOCALE));
  const contato = rows.find((row) => row.key === "contato");
  const position = contato?.position ?? rows.length;

  console.log(`criar seção "${KEY}" na posição ${position}, antes do contato`);
  console.log(`  título: ${payload.header.title.lead} ${payload.header.title.accent}`);
  console.log(`  arquivo: ${payload.file}`);

  const conhece = await siteJaConheceAColinha();
  if (conhece === false) {
    console.error(
      "\nO site publicado ainda não conhece esta seção.\n" +
        "Criar a linha agora faria o site cair para o conteúdo padrão até o deploy.\n" +
        "Faça o deploy primeiro e rode de novo.",
    );
    process.exit(1);
  }
  if (conhece === null) {
    console.log("\n(não deu para conferir o site publicado — confirme que o deploy já saiu)");
  }

  if (!apply) {
    console.log("\nSimulação — nada foi gravado.");
    console.log("Para criar: pnpm --filter painel criar-secao-colinha --aplicar");
    return;
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    // Abre espaço: o contato e o que vier depois descem uma posição.
    for (const row of rows.filter((r) => r.position >= position)) {
      await tx
        .update(tables.sections)
        .set({ position: row.position + 1 })
        .where(and(eq(tables.sections.locale, LOCALE), eq(tables.sections.key, row.key)));
    }

    await tx.insert(tables.sections).values({
      locale: LOCALE,
      key: KEY,
      position,
      visible: true,
      draftJson: payload,
      publishedJson: payload,
      draftUpdatedAt: now,
      publishedAt: now,
    });
  });

  console.log("\nLinha criada, já publicada com o conteúdo padrão.");
  console.log("A seção passa a aparecer no painel, em Conteúdo, para editar como as outras.");
}

// Sem await de topo: este pacote não é ESM, e o tsx transpila para CJS.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
