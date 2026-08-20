import type { SectionKey } from "@campanha/content";
import { desc, eq } from "drizzle-orm";
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
