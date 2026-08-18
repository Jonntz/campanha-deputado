import { z } from "zod";
import {
  analyticsSchema,
  bioSchema,
  contactSchema,
  credentialsSchema,
  footerSchema,
  gallerySchema,
  heroSchema,
  identitySchema,
  navSchema,
  proposalsSchema,
  seoSchema,
  uiLabelsSchema,
  type SiteContent,
} from "./schema";
import { SECTION_KEYS, type SectionKey } from "./sections";

/**
 * Divisão do documento no formato em que ele é persistido.
 *
 * Uma linha por seção, mais uma linha de configurações globais. Editar uma
 * seção é um UPDATE só, então dois editores em seções diferentes não se
 * sobrescrevem — e um payload corrompido derruba apenas a sua seção, e não o
 * site inteiro. Essa contenção é o motivo de a divisão existir.
 */

/** O que não pertence a nenhuma seção: vale para a página toda. */
export const settingsSchema = z.object({
  identity: identitySchema,
  seo: seoSchema,
  nav: navSchema,
  footer: footerSchema,
  analytics: analyticsSchema,
  ui: uiLabelsSchema,
});

export type Settings = z.infer<typeof settingsSchema>;

/**
 * A chave da seção é a âncora no DOM (em português); a chave no documento é o
 * nome do conteúdo (em inglês). O mapa mantém os dois explícitos em vez de
 * fazer um virar o outro por convenção — que é onde esse tipo de correspondência
 * costuma quebrar em silêncio.
 */
export const SECTION_CONTENT_KEY = {
  inicio: "hero",
  credenciais: "credentials",
  bio: "bio",
  propostas: "proposals",
  galeria: "gallery",
  contato: "contact",
} as const satisfies Record<SectionKey, keyof SiteContent>;

export const SECTION_PAYLOAD_SCHEMAS = {
  inicio: heroSchema,
  credenciais: credentialsSchema,
  bio: bioSchema,
  propostas: proposalsSchema,
  galeria: gallerySchema,
  contato: contactSchema,
} as const;

export type SectionPayloads = {
  [K in SectionKey]: z.infer<(typeof SECTION_PAYLOAD_SCHEMAS)[K]>;
};

export type ContentDocument = {
  settings: Settings;
  sections: SectionPayloads;
};

/** Documento completo → formato persistido. */
export function splitContent(content: SiteContent): ContentDocument {
  return {
    settings: {
      identity: content.identity,
      seo: content.seo,
      nav: content.nav,
      footer: content.footer,
      analytics: content.analytics,
      ui: content.ui,
    },
    sections: {
      inicio: content.hero,
      credenciais: content.credentials,
      bio: content.bio,
      propostas: content.proposals,
      galeria: content.gallery,
      contato: content.contact,
    },
  };
}

/** Formato persistido → documento completo. */
export function composeContent(document: ContentDocument): SiteContent {
  const { settings, sections } = document;
  return {
    identity: settings.identity,
    seo: settings.seo,
    nav: settings.nav,
    footer: settings.footer,
    analytics: settings.analytics,
    ui: settings.ui,
    hero: sections.inicio,
    credentials: sections.credenciais,
    bio: sections.bio,
    proposals: sections.propostas,
    gallery: sections.galeria,
    contact: sections.contato,
  };
}

export type MergeIssue = { part: string; message: string };

export type MergeResult = {
  content: SiteContent;
  /** Vazio quando tudo veio do banco. Não-vazio merece log e alerta. */
  issues: MergeIssue[];
};

/**
 * Monta o conteúdo a partir do que veio do banco, caindo para o padrão em cada
 * parte que faltar ou não passar na validação.
 *
 * A granularidade é o ponto: uma seção inválida não pode levar as outras
 * cinco junto. O site da campanha precisa continuar no ar mesmo com um payload
 * ruim, e essa é a última linha de defesa antes de a página quebrar.
 */
export function mergeWithDefaults(
  defaults: SiteContent,
  raw: { settings?: unknown; sections?: Partial<Record<SectionKey, unknown>> },
): MergeResult {
  const fallback = splitContent(defaults);
  const issues: MergeIssue[] = [];

  const settingsResult = settingsSchema.safeParse(raw.settings);
  if (!settingsResult.success) {
    issues.push({
      part: "settings",
      message: raw.settings === undefined
        ? "ausente no banco"
        : z.prettifyError(settingsResult.error),
    });
  }

  // O laço percorre a união de chaves, e o TypeScript passa a exigir que o
  // valor sirva para todas elas ao mesmo tempo. A escrita passa por um alias
  // solto e o tipo é reafirmado uma vez só, no fim: cada valor já foi validado
  // pelo schema da sua própria chave logo acima.
  const sections: Record<string, unknown> = { ...fallback.sections };
  for (const key of SECTION_KEYS) {
    const value = raw.sections?.[key];
    const result = SECTION_PAYLOAD_SCHEMAS[key].safeParse(value);
    if (result.success) {
      sections[key] = result.data;
    } else {
      issues.push({
        part: key,
        message: value === undefined
          ? "ausente no banco"
          : z.prettifyError(result.error),
      });
    }
  }

  return {
    content: composeContent({
      settings: settingsResult.success ? settingsResult.data : fallback.settings,
      sections: sections as SectionPayloads,
    }),
    issues,
  };
}
