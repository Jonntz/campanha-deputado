import {
  SECTION_KEYS,
  type SectionKey,
  type Settings,
  type SectionPayloads,
} from "@campanha/content";
import { eq } from "drizzle-orm";
import type { Database } from "./client";
import { sections, settings } from "./schema";

export type RawDocument = {
  settings?: unknown;
  sections?: Partial<Record<SectionKey, unknown>>;
  /** Ordem e visibilidade vêm de colunas, não do payload. */
  layout?: { key: SectionKey; position: number; visible: boolean }[];
};

/**
 * Lê a versão publicada.
 *
 * Devolve `unknown` de propósito: quem chama passa por `mergeWithDefaults`,
 * que valida cada parte em separado e cai para o padrão só naquilo que estiver
 * quebrado. Tipar aqui como já-válido seria mentir sobre o que vem do banco.
 */
export async function readPublishedDocument(
  db: Database,
  locale = "pt-BR",
): Promise<RawDocument> {
  const [settingsRow, sectionRows] = await Promise.all([
    db.select().from(settings).where(eq(settings.locale, locale)).limit(1),
    db.select().from(sections).where(eq(sections.locale, locale)),
  ]);

  const payloads: Partial<Record<SectionKey, unknown>> = {};
  const layout: NonNullable<RawDocument["layout"]> = [];

  for (const row of sectionRows) {
    if (row.publishedJson == null) continue;
    payloads[row.key] = row.publishedJson;
    layout.push({ key: row.key, position: row.position, visible: row.visible });
  }

  layout.sort((a, b) => a.position - b.position);

  return {
    settings: settingsRow[0]?.publishedJson ?? undefined,
    sections: payloads,
    layout,
  };
}

/** Mesma leitura, mas do rascunho — usada pela pré-visualização e pelo painel. */
export async function readDraftDocument(
  db: Database,
  locale = "pt-BR",
): Promise<RawDocument> {
  const [settingsRow, sectionRows] = await Promise.all([
    db.select().from(settings).where(eq(settings.locale, locale)).limit(1),
    db.select().from(sections).where(eq(sections.locale, locale)),
  ]);

  const payloads: Partial<Record<SectionKey, unknown>> = {};
  const layout: NonNullable<RawDocument["layout"]> = [];

  for (const row of sectionRows) {
    payloads[row.key] = row.draftJson;
    layout.push({ key: row.key, position: row.position, visible: row.visible });
  }

  layout.sort((a, b) => a.position - b.position);

  return {
    settings: settingsRow[0]?.draftJson ?? undefined,
    sections: payloads,
    layout,
  };
}

/**
 * Grava um documento inteiro como rascunho e publicado ao mesmo tempo.
 * Usado pelo seed inicial — o painel grava rascunho e publica em passos
 * separados.
 */
export async function writeWholeDocument(
  db: Database,
  document: { settings: Settings; sections: SectionPayloads },
  options: { locale?: string; author?: string } = {},
) {
  const locale = options.locale ?? "pt-BR";
  const now = new Date();
  const author = options.author ?? "seed";

  await db
    .insert(settings)
    .values({
      locale,
      draftJson: document.settings,
      publishedJson: document.settings,
      draftUpdatedAt: now,
      publishedAt: now,
      updatedBy: author,
    })
    .onConflictDoUpdate({
      target: settings.locale,
      set: {
        draftJson: document.settings,
        publishedJson: document.settings,
        draftUpdatedAt: now,
        publishedAt: now,
        updatedBy: author,
      },
    });

  for (const [index, key] of SECTION_KEYS.entries()) {
    const payload = document.sections[key];
    await db
      .insert(sections)
      .values({
        locale,
        key,
        position: index,
        visible: true,
        draftJson: payload,
        publishedJson: payload,
        draftUpdatedAt: now,
        publishedAt: now,
        updatedBy: author,
      })
      .onConflictDoUpdate({
        target: [sections.locale, sections.key],
        set: {
          position: index,
          draftJson: payload,
          publishedJson: payload,
          draftUpdatedAt: now,
          publishedAt: now,
          updatedBy: author,
        },
      });
  }
}
