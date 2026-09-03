import type { SectionKey } from "@campanha/content";
import { desc, eq, like, or, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Database } from "./client";
import { media, sections, settings } from "./schema";

export type MediaRecord = typeof media.$inferSelect;

export async function listMedia(db: Database): Promise<MediaRecord[]> {
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function findMediaByChecksum(
  db: Database,
  checksum: string,
): Promise<MediaRecord | undefined> {
  const rows = await db
    .select()
    .from(media)
    .where(eq(media.checksum, checksum))
    .limit(1);
  return rows[0];
}

export async function insertMedia(
  db: Database,
  record: typeof media.$inferInsert,
): Promise<MediaRecord> {
  const rows = await db.insert(media).values(record).returning();
  const inserted = rows[0];
  if (!inserted) throw new Error("Falha ao gravar a mídia.");
  return inserted;
}

export async function updateMediaAlt(db: Database, id: string, defaultAlt: string) {
  await db.update(media).set({ defaultAlt }).where(eq(media.id, id));
}

/**
 * Onde uma mídia está sendo usada.
 *
 * Varre os payloads em vez de manter tabela de ligação: o `MediaRef` gravado na
 * seção é desnormalizado de propósito (para o site ler tudo numa consulta só),
 * então a ligação não existe como linha. Com sete linhas de conteúdo, varrer é
 * instantâneo — e não cria um segundo lugar para a verdade divergir.
 */
export async function findMediaUsage(
  db: Database,
  mediaId: string,
  locale = "pt-BR",
): Promise<string[]> {
  const [sectionRows, settingsRows] = await Promise.all([
    db.select().from(sections).where(eq(sections.locale, locale)),
    db.select().from(settings).where(eq(settings.locale, locale)),
  ]);

  const used: string[] = [];
  const needle = JSON.stringify(mediaId);

  for (const row of sectionRows) {
    const haystack = JSON.stringify([row.draftJson, row.publishedJson]);
    if (haystack.includes(needle)) used.push(row.key satisfies SectionKey);
  }

  const s = settingsRows[0];
  if (s && JSON.stringify([s.draftJson, s.publishedJson]).includes(needle)) {
    used.push("configurações");
  }

  return used;
}

export async function deleteMedia(db: Database, id: string) {
  await db.delete(media).where(eq(media.id, id));
}

/**
 * Mídias que ficaram gravadas em disco local em vez de no armazenamento de
 * objetos. São as que quebram em produção: a pasta é ignorada pelo Git e o
 * sistema de arquivos das funções é somente-leitura.
 */
export async function listLocalMedia(db: Database): Promise<MediaRecord[]> {
  return db.select().from(media).where(like(media.url, "/uploads/%"));
}

/**
 * Troca a URL de uma mídia em todo lugar onde ela aparece.
 *
 * Precisa reescrever os payloads das seções porque o `MediaRef` é
 * desnormalizado de propósito — a URL está copiada dentro do JSON, não
 * referenciada por id. Atualizar só a linha da mídia deixaria as seções
 * apontando para o endereço antigo.
 */
export async function rewriteMediaUrl(
  db: Database,
  input: { id: string; oldUrl: string; newUrl: string; newPathname: string },
): Promise<number> {
  const { id, oldUrl, newUrl, newPathname } = input;

  await db
    .update(media)
    .set({ url: newUrl, pathname: newPathname })
    .where(eq(media.id, id));

  const swap = (column: SQLiteColumn) =>
    sql`replace(${column}, ${oldUrl}, ${newUrl})`;

  const touched = await db
    .update(sections)
    .set({
      draftJson: swap(sections.draftJson),
      publishedJson: swap(sections.publishedJson),
    })
    .where(
      or(
        like(sections.draftJson, `%${oldUrl}%`),
        like(sections.publishedJson, `%${oldUrl}%`),
      ),
    );

  await db.update(settings).set({
    draftJson: swap(settings.draftJson),
    publishedJson: swap(settings.publishedJson),
  });

  return touched.rowsAffected ?? 0;
}
