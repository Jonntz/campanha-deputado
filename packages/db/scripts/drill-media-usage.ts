/**
 * Ensaio da proteção contra apagar mídia em uso.
 *
 * O `MediaRef` gravado na seção é desnormalizado — carrega url e dimensões — e
 * não existe chave estrangeira. Sem esta checagem, apagar um arquivo ainda
 * referenciado deixaria uma imagem quebrada no site, e nada avisaria antes de
 * a página renderizar.
 */
import { and, eq } from "drizzle-orm";
import { createDatabase } from "../src/client";
import { findMediaUsage, listMedia } from "../src/media";
import { sections } from "../src/schema";

const db = createDatabase();
const [item] = await listMedia(db);

if (!item) {
  console.error("nenhuma mídia na biblioteca — rode o teste de upload antes");
  process.exit(1);
}

console.log("mídia:", item.id);
console.log("uso antes de vincular:", (await findMediaUsage(db, item.id)).join(", ") || "(nenhum)");

// vincula a mídia ao Hero, como o painel faria
const row = (
  await db
    .select()
    .from(sections)
    .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, "inicio")))
    .limit(1)
)[0]!;
const payload = row.draftJson as { image: Record<string, unknown> };
const original = payload.image;

await db
  .update(sections)
  .set({ draftJson: { ...payload, image: { ...original, mediaId: item.id } } as never })
  .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, "inicio")));

const usage = await findMediaUsage(db, item.id);
console.log("uso depois de vincular:", usage.join(", ") || "(nenhum)");
console.log(usage.includes("inicio") ? "→ apagar seria bloqueado (correto)" : "→ FALHA: uso não detectado");

await db
  .update(sections)
  .set({ draftJson: { ...payload, image: original } as never })
  .where(and(eq(sections.locale, "pt-BR"), eq(sections.key, "inicio")));
console.log("vínculo desfeito:", (await findMediaUsage(db, item.id)).join(", ") || "(nenhum)");
