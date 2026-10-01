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

/**
 * Guarda ordem e visibilidade como rascunho.
 *
 * São colunas, e não payload, então reordenar não reescreve o conteúdo de
 * ninguém. Escreve nas colunas de rascunho: o site lê as publicadas, e quem
 * reordena passa pela mesma revisão de quem edita um texto.
 */
export async function saveLayout(
  db: Database,
  layout: { key: SectionKey; position: number; visible: boolean }[],
  locale = DEFAULT_LOCALE,
) {
  for (const slot of layout) {
    await db
      .update(sections)
      .set({ draftPosition: slot.position, draftVisible: slot.visible })
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
    // A ordem e a visibilidade contam junto com o texto: sem isto, mover uma
    // seção não aparecia como pendente e o botão de publicar ficava inerte.
    const conteudo = canonical(row.draftJson) !== canonical(row.publishedJson);
    const ordem = row.draftPosition != null && row.draftPosition !== row.position;
    const visibilidade = row.draftVisible != null && row.draftVisible !== row.visible;

    if (conteudo || ordem || visibilidade) {
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
        .set({
          publishedJson: row.draftJson,
          position: row.draftPosition ?? row.position,
          visible: row.draftVisible ?? row.visible,
          // Zerar o rascunho mantém "null = nada pendente" verdadeiro.
          draftPosition: null,
          draftVisible: null,
          publishedAt: now,
        })
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


export type SectionPlacement = {
  /** A linha já está no banco. */
  exists: boolean;
  /** Posição que a seção tem, ou que receberia ao ser criada. */
  position: number;
};

/** Serve tanto o banco quanto uma transação: ler e escrever é igual nos dois. */
type Querier = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

async function placement(
  db: Querier,
  key: SectionKey,
  before: SectionKey | undefined,
  locale: string,
): Promise<{ rows: { key: SectionKey; position: number }[] } & SectionPlacement> {
  const rows = await db
    .select({ key: sections.key, position: sections.position })
    .from(sections)
    .where(eq(sections.locale, locale));

  const existing = rows.find((row) => row.key === key);
  if (existing) return { rows, exists: true, position: existing.position };

  const anchor = before ? rows.find((row) => row.key === before) : undefined;
  return { rows, exists: false, position: anchor?.position ?? rows.length };
}

/** Onde uma seção entraria, sem gravar nada. */
export async function planSectionRow(
  db: Database,
  key: SectionKey,
  before?: SectionKey,
  locale = DEFAULT_LOCALE,
): Promise<SectionPlacement> {
  const { exists, position } = await placement(db, key, before, locale);
  return { exists, position };
}

/**
 * Cria a linha de uma seção que o código já conhece mas o banco ainda não.
 *
 * O site renderiza a seção a partir do conteúdo padrão mesmo sem linha, mas o
 * painel monta a lista de Conteúdo a partir das linhas — sem esta, a seção não
 * aparece para editar. Entra antes de `before`, empurrando o resto; sem
 * `before`, vai para o fim. Nasce publicada: o que o site já mostra é
 * exatamente este payload, então publicar depois não mudaria nada.
 */
export async function createSectionRow<K extends SectionKey>(
  db: Database,
  key: K,
  payload: SectionPayloads[K],
  before?: SectionKey,
  locale = DEFAULT_LOCALE,
): Promise<SectionPlacement> {
  const now = new Date();

  return db.transaction(async (tx) => {
    // Recalcula dentro da transação: entre o plano e a gravação alguém pode
    // ter reordenado as seções pelo painel.
    const { rows, exists, position } = await placement(tx, key, before, locale);
    if (exists) return { exists, position };

    for (const row of rows.filter((candidate) => candidate.position >= position)) {
      await tx
        .update(sections)
        .set({ position: row.position + 1 })
        .where(and(eq(sections.locale, locale), eq(sections.key, row.key)));
    }

    await tx.insert(sections).values({
      locale,
      key,
      position,
      visible: true,
      draftJson: payload,
      publishedJson: payload,
      draftUpdatedAt: now,
      publishedAt: now,
    });

    return { exists: false, position };
  });
}
