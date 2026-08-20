import {
  SECTION_KEYS,
  SECTION_PAYLOAD_SCHEMAS,
  settingsSchema,
  type SectionKey,
} from "@campanha/content";
import { and, desc, eq } from "drizzle-orm";
import { user } from "./auth-schema";
import type { Database } from "./client";
import { publishEvents, sectionRevisions, sections, settings } from "./schema";

/**
 * Histórico de edições e publicações.
 *
 * As revisões já eram gravadas a cada salvamento desde o início; o que faltava
 * era poder olhar e voltar atrás.
 */

export const SETTINGS_KEY = "__settings";
const DEFAULT_LOCALE = "pt-BR";

export type PublishEntry = {
  id: string;
  createdAt: Date;
  author: string;
  sections: string[];
  revalidateOk: boolean | null;
  revalidateError: string | null;
};

export async function listPublishEvents(
  db: Database,
  limit = 30,
): Promise<PublishEntry[]> {
  const rows = await db
    .select({
      id: publishEvents.id,
      createdAt: publishEvents.createdAt,
      authorId: publishEvents.authorId,
      authorName: user.name,
      sectionsJson: publishEvents.sectionsJson,
      revalidateOk: publishEvents.revalidateOk,
      revalidateError: publishEvents.revalidateError,
    })
    .from(publishEvents)
    .leftJoin(user, eq(user.id, publishEvents.authorId))
    .orderBy(desc(publishEvents.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    // O autor pode ter sido removido depois, ou vir de um script de manutenção.
    author: row.authorName ?? row.authorId ?? "desconhecido",
    sections: row.sectionsJson,
    revalidateOk: row.revalidateOk,
    revalidateError: row.revalidateError,
  }));
}

export type RevisionEntry = {
  id: string;
  sectionKey: string;
  kind: "save" | "publish";
  createdAt: Date;
  author: string;
};

export async function listRevisions(
  db: Database,
  sectionKey: string,
  limit = 20,
  locale = DEFAULT_LOCALE,
): Promise<RevisionEntry[]> {
  const rows = await db
    .select({
      id: sectionRevisions.id,
      sectionKey: sectionRevisions.sectionKey,
      kind: sectionRevisions.kind,
      createdAt: sectionRevisions.createdAt,
      authorId: sectionRevisions.authorId,
      authorName: user.name,
    })
    .from(sectionRevisions)
    .leftJoin(user, eq(user.id, sectionRevisions.authorId))
    .where(
      and(
        eq(sectionRevisions.locale, locale),
        eq(sectionRevisions.sectionKey, sectionKey),
      ),
    )
    .orderBy(desc(sectionRevisions.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    sectionKey: row.sectionKey,
    kind: row.kind,
    createdAt: row.createdAt,
    author: row.authorName ?? row.authorId ?? "desconhecido",
  }));
}

function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

/**
 * Devolve uma revisão ao rascunho.
 *
 * Nunca escreve direto no publicado: restaurar traz o texto de volta para o
 * editor, e levar ao site continua exigindo apertar Publicar. Assim é possível
 * conferir o que voltou antes de a campanha inteira ver.
 */
export async function restoreRevision(
  db: Database,
  revisionId: string,
  authorId: string,
  locale = DEFAULT_LOCALE,
): Promise<{ ok: boolean; sectionKey?: string; message: string }> {
  const rows = await db
    .select()
    .from(sectionRevisions)
    .where(eq(sectionRevisions.id, revisionId))
    .limit(1);

  const revision = rows[0];
  if (!revision) {
    return { ok: false, message: "Revisão não encontrada." };
  }

  const now = new Date();

  /**
   * Valida antes de escrever.
   *
   * Uma revisão guardada meses atrás pode não caber mais no schema — um campo
   * que passou a ser obrigatório, um limite que apertou. Sem esta checagem a
   * restauração gravaria um rascunho quebrado, e o erro só apareceria na hora
   * de publicar.
   */
  if (revision.sectionKey === SETTINGS_KEY) {
    const parsed = settingsSchema.safeParse(revision.json);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Esta versão não é mais compatível com o formato atual.",
      };
    }
    await db
      .update(settings)
      .set({ draftJson: parsed.data, draftUpdatedAt: now, updatedBy: authorId })
      .where(eq(settings.locale, locale));
  } else if (isSectionKey(revision.sectionKey)) {
    const parsed = SECTION_PAYLOAD_SCHEMAS[revision.sectionKey].safeParse(
      revision.json,
    );
    if (!parsed.success) {
      return {
        ok: false,
        message: "Esta versão não é mais compatível com o formato atual.",
      };
    }
    await db
      .update(sections)
      .set({
        draftJson: parsed.data as never,
        draftUpdatedAt: now,
        updatedBy: authorId,
      })
      .where(and(eq(sections.locale, locale), eq(sections.key, revision.sectionKey)));
  } else {
    return { ok: false, message: "Revisão de uma seção desconhecida." };
  }

  // A própria restauração vira revisão: desfazer um desfazer também é possível.
  await db.insert(sectionRevisions).values({
    id: crypto.randomUUID(),
    locale,
    sectionKey: revision.sectionKey,
    json: revision.json,
    kind: "save",
    authorId,
  });

  return {
    ok: true,
    sectionKey: revision.sectionKey,
    message: "Restaurado no rascunho. Publique para levar ao site.",
  };
}
