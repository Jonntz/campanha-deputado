import {
  type SectionKey,
  type SectionPayloads,
  type Settings,
} from "@campanha/content";
import { and, eq } from "drizzle-orm";
import type { Database } from "./client";
import { publishEvents, sectionRevisions, sections, settings } from "./schema";

/** Chave usada no histórico para a linha de configurações globais. */
const SETTINGS_KEY = "__settings";

const DEFAULT_LOCALE = "pt-BR";

/** Comparação estável: a ordem das chaves do objeto não é significativa. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
            a.localeCompare(b),
          ),
        )
      : v,
  );
}

async function recordRevision(
  db: Database,
  input: {
    locale: string;
    sectionKey: string;
    json: unknown;
    kind: "save" | "publish";
    authorId: string;
  },
) {
  await db.insert(sectionRevisions).values({
    id: crypto.randomUUID(),
    locale: input.locale,
    sectionKey: input.sectionKey,
    json: input.json,
    kind: input.kind,
    authorId: input.authorId,
  });
}

/**
 * Grava o rascunho de uma seção.
 *
 * Um UPDATE por seção, e não uma reescrita do documento: dois editores em
 * seções diferentes não têm como se sobrescrever.
 */
export async function saveSectionDraft<K extends SectionKey>(
  db: Database,
  key: K,
  payload: SectionPayloads[K],
  authorId: string,
  locale = DEFAULT_LOCALE,
) {
  await db
    .update(sections)
    .set({ draftJson: payload, draftUpdatedAt: new Date(), updatedBy: authorId })
    .where(and(eq(sections.locale, locale), eq(sections.key, key)));

  await recordRevision(db, {
    locale,
    sectionKey: key,
    json: payload,
    kind: "save",
    authorId,
  });
}

export async function saveSettingsDraft(
  db: Database,
  payload: Settings,
  authorId: string,
  locale = DEFAULT_LOCALE,
) {
  await db
    .update(settings)
    .set({ draftJson: payload, draftUpdatedAt: new Date(), updatedBy: authorId })
    .where(eq(settings.locale, locale));

  await recordRevision(db, {
    locale,
    sectionKey: SETTINGS_KEY,
    json: payload,
    kind: "save",
    authorId,
  });
}

/** Ordem e visibilidade são colunas, então reordenar não reescreve payload. */
export async function saveLayout(
  db: Database,
  layout: { key: SectionKey; position: number; visible: boolean }[],
  locale = DEFAULT_LOCALE,
) {
  for (const slot of layout) {
    await db
      .update(sections)
      .set({ position: slot.position, visible: slot.visible })
      .where(and(eq(sections.locale, locale), eq(sections.key, slot.key)));
  }
}

export type PendingChange = { key: string; label: string };

/** O que está no rascunho e ainda não foi publicado. */
export async function getPendingChanges(
  db: Database,
  locale = DEFAULT_LOCALE,
): Promise<PendingChange[]> {
  const [settingsRow, sectionRows] = await Promise.all([
    db.select().from(settings).where(eq(settings.locale, locale)).limit(1),
    db.select().from(sections).where(eq(sections.locale, locale)),
  ]);

  const pending: PendingChange[] = [];

  const s = settingsRow[0];
  if (s && canonical(s.draftJson) !== canonical(s.publishedJson)) {
    pending.push({ key: SETTINGS_KEY, label: "Configurações" });
  }

  for (const row of sectionRows) {
    if (canonical(row.draftJson) !== canonical(row.publishedJson)) {
      pending.push({ key: row.key, label: row.key });
    }
  }

  return pending;
}

/**
 * Publica tudo que está pendente, numa transação.
 *
 * Atômico de propósito: publicar metade das seções deixaria o site num estado
 * que nenhum editor pediu.
 */
export async function publishAll(
  db: Database,
  authorId: string,
  locale = DEFAULT_LOCALE,
): Promise<{ eventId: string | null; published: string[] }> {
  const pending = await getPendingChanges(db, locale);
  if (pending.length === 0) return { eventId: null, published: [] };

  const now = new Date();
  const eventId = crypto.randomUUID();

  await db.transaction(async (tx) => {
    for (const change of pending) {
      if (change.key === SETTINGS_KEY) {
        const row = (
          await tx.select().from(settings).where(eq(settings.locale, locale)).limit(1)
        )[0];
        if (!row) continue;
        await tx
          .update(settings)
          .set({ publishedJson: row.draftJson, publishedAt: now })
          .where(eq(settings.locale, locale));
        continue;
      }

      const key = change.key as SectionKey;
      const row = (
        await tx
          .select()
          .from(sections)
          .where(and(eq(sections.locale, locale), eq(sections.key, key)))
          .limit(1)
      )[0];
      if (!row) continue;

      await tx
        .update(sections)
        .set({ publishedJson: row.draftJson, publishedAt: now })
        .where(and(eq(sections.locale, locale), eq(sections.key, key)));
    }

    await tx.insert(publishEvents).values({
      id: eventId,
      authorId,
      sectionsJson: pending.map((change) => change.key),
    });
  });

  return { eventId, published: pending.map((change) => change.key) };
}

/**
 * Registra se o site chegou a ser avisado.
 *
 * Publicar e revalidar são coisas separadas: o conteúdo já está publicado no
 * banco mesmo que a chamada ao site falhe. Guardar o resultado é o que permite
 * o painel oferecer "tentar de novo" em vez de fingir que deu certo.
 */
export async function recordRevalidation(
  db: Database,
  eventId: string,
  result: { ok: boolean; error?: string },
) {
  await db
    .update(publishEvents)
    .set({ revalidateOk: result.ok, revalidateError: result.error ?? null })
    .where(eq(publishEvents.id, eventId));
}

