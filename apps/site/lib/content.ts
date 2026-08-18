import "server-only";

import {
  SECTION_KEYS,
  SECTION_REGISTRY,
  defaultContent,
  mergeWithDefaults,
  siteContentSchema,
  type MergeIssue,
  type SectionKey,
  type SiteContent,
} from "@campanha/content";
import { createDatabase, readPublishedDocument } from "@campanha/db";
import { cache } from "react";

/**
 * Leitura do conteúdo publicado.
 *
 * A regra que sustenta o desenho: **o Turso nunca entra no caminho da
 * requisição**. A página é estática com ISR, então o banco é consultado no
 * build e nas revalidações. Se ele cair às 3h da manhã, o CDN continua
 * servindo o último HTML bom por tempo indeterminado — a queda afeta a
 * capacidade de publicar, não o site no ar.
 *
 * Sobre isso vêm mais duas camadas: se uma regeneração falhar, o Next mantém o
 * resultado anterior; e se um payload vier quebrado, `mergeWithDefaults` cai
 * para o padrão commitado apenas naquela seção.
 */

/** Um banco pendurado não pode travar o build. */
const READ_TIMEOUT_MS = 4000;

export type SectionSlot = { key: SectionKey; visible: boolean };

export type SiteData = {
  content: SiteContent;
  /** Já na ordem de renderização. */
  sections: readonly SectionSlot[];
  source: "database" | "defaults";
  /** Não-vazio significa que alguma parte caiu para o padrão. */
  issues: MergeIssue[];
};

const DEFAULT_SECTIONS: readonly SectionSlot[] = SECTION_KEYS.map((key) => ({
  key,
  visible: true,
}));

const DEFAULT_DATA: SiteData = {
  content: defaultContent,
  sections: DEFAULT_SECTIONS,
  source: "defaults",
  issues: [],
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`tempo esgotado após ${ms}ms`)), ms),
    ),
  ]);
}

/**
 * Ordena as seções pelo que veio do banco e completa o que faltar.
 *
 * Uma seção sem linha publicada não some da página: ela entra com o conteúdo
 * padrão, na posição que tem no registro. Sumir seria uma falha silenciosa
 * bem pior do que mostrar o texto antigo.
 */
function resolveSections(
  layout: { key: SectionKey; position: number; visible: boolean }[] | undefined,
): readonly SectionSlot[] {
  if (!layout?.length) return DEFAULT_SECTIONS;

  const seen = new Set(layout.map((row) => row.key));
  const slots: SectionSlot[] = layout.map((row) => ({
    key: row.key,
    // `inicio` é o alvo do link da marca e o estado inicial do scrollspy:
    // ocultá-la quebraria a navegação, então o painel não pode fazê-lo.
    visible: SECTION_REGISTRY[row.key].canHide ? row.visible : true,
  }));

  for (const [index, key] of SECTION_KEYS.entries()) {
    if (!seen.has(key)) slots.splice(index, 0, { key, visible: true });
  }

  return slots;
}

/**
 * `cache` do React deduplica dentro de uma mesma renderização: o
 * `generateMetadata` do layout e a página compartilham uma única consulta.
 */
export const getSiteData = cache(async (): Promise<SiteData> => {
  if (!process.env.TURSO_DATABASE_URL) {
    // Preview sem banco configurado, ou CI: o padrão commitado basta.
    return DEFAULT_DATA;
  }

  try {
    const raw = await withTimeout(
      readPublishedDocument(createDatabase()),
      READ_TIMEOUT_MS,
    );
    const { content, issues } = mergeWithDefaults(defaultContent, raw);

    if (issues.length > 0) {
      console.error(
        "[content] partes caíram para o padrão:",
        issues.map((issue) => issue.part).join(", "),
      );
    }

    return {
      content,
      sections: resolveSections(raw.layout),
      source: "database",
      issues,
    };
  } catch (error) {
    // Deliberadamente não relança: o site precisa subir mesmo sem banco.
    console.error("[content] banco indisponível, usando o padrão:", error);
    return DEFAULT_DATA;
  }
});

/** Atalho para quem só precisa do conteúdo. */
export async function getSiteContent(): Promise<SiteContent> {
  return (await getSiteData()).content;
}

/**
 * Validação do padrão, só em desenvolvimento. Em produção não roda sobre ele de
 * propósito: é a rede de segurança para quando o banco falhar, e não pode ser
 * capaz de lançar.
 */
if (process.env.NODE_ENV === "development") {
  const result = siteContentSchema.safeParse(defaultContent);
  if (!result.success) {
    console.error("[content] conteúdo padrão fora do schema:", result.error.issues);
  }
}
