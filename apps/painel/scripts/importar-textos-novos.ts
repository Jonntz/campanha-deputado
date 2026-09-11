/**
 * Importa os textos do layout novo como RASCUNHO.
 *
 * Aplica, sobre o rascunho atual, só os campos que o layout novo redefiniu:
 * títulos, textos, resumos das propostas, legendas, rótulos, número de urna,
 * CNPJ e o retrato da abertura. O resto fica como a equipe deixou — etiqueta e
 * fonte das propostas, credenciais, contatos, links, itens que alguém acrescentou
 * pelo painel. Itens casam por id; um item apagado pela equipe não volta.
 *
 * Nada vai ao ar: o conteúdo publicado não é tocado. Levar ao site continua
 * exigindo revisar e apertar Publicar, e a versão anterior fica no Histórico.
 *
 * Uso:
 *   pnpm --filter painel importar-textos             # só mostra o que mudaria
 *   pnpm --filter painel importar-textos --aplicar   # grava os rascunhos
 */
import {
  SECTION_PAYLOAD_SCHEMAS,
  defaultContent,
  settingsSchema,
  splitContent,
  type SectionKey,
  type SectionPayloads,
  type Settings,
} from "@campanha/content";
import {
  createDatabase,
  readDraftDocument,
  saveSectionDraft,
  saveSettingsDraft,
} from "@campanha/db";

const AUTHOR = "importacao-layout-novo";
const target = splitContent(defaultContent);

function byId<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

/** Caminhos das folhas que diferem entre dois valores. */
function diff(before: unknown, after: unknown, path = ""): string[] {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);
  if (isObject(before) && isObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return [...keys].flatMap((key) => diff(before[key], after[key], path ? `${path}.${key}` : key));
  }
  return [path || "(raiz)"];
}

const short = (value: unknown) => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text === undefined ? "∅" : text.length > 70 ? `${text.slice(0, 67)}…` : text;
};

function get(object: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (current, key) => (current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined),
    object,
  );
}

function parseSection<K extends SectionKey>(key: K, raw: unknown): SectionPayloads[K] {
  const result = SECTION_PAYLOAD_SCHEMAS[key].safeParse(raw);
  if (!result.success) {
    throw new Error(`O rascunho atual de "${key}" não passa na validação — nada foi importado.`);
  }
  return result.data as SectionPayloads[K];
}

async function main() {
  const apply = process.argv.includes("--aplicar");
  const db = createDatabase();
  const raw = await readDraftDocument(db);
  const drafts = raw.sections ?? {};
  const t = target.sections;

  // ---------------- configurações ----------------
  const settingsResult = settingsSchema.safeParse(raw.settings);
  if (!settingsResult.success) {
    throw new Error("O rascunho atual das configurações não passa na validação — nada foi importado.");
  }
  const s0 = settingsResult.data;
  const ts = target.settings;

  const s1: Settings = {
    ...s0,
    identity: {
      ...s0.identity,
      role: ts.identity.role,
      tagline: ts.identity.tagline,
      number: ts.identity.number,
    },
    seo: {
      ...s0.seo,
      description: ts.seo.description,
      ogDescription: ts.seo.ogDescription,
      jsonLdDescription: ts.seo.jsonLdDescription,
      keywords: ts.seo.keywords,
      themeColor: ts.seo.themeColor,
    },
    nav: {
      ...s0.nav,
      ctaLabel: ts.nav.ctaLabel,
      items: s0.nav.items.map((item) => {
        const next = ts.nav.items.find((n) => n.sectionKey === item.sectionKey);
        return next ? { ...item, label: next.label, visible: next.visible } : item;
      }),
    },
    footer: {
      ...s0.footer,
      tagline: ts.footer.tagline,
      legal: ts.footer.legal,
      cnpj: ts.footer.cnpj,
    },
    ui: {
      ...s0.ui,
      videoFallback: ts.ui.videoFallback,
      menuTitle: ts.ui.menuTitle,
      menuWhatsapp: ts.ui.menuWhatsapp,
      menuDonate: ts.ui.menuDonate,
      backToTop: ts.ui.backToTop,
      videosKicker: ts.ui.videosKicker,
    },
  };

  // ---------------- seções ----------------
  const hero = parseSection("inicio", drafts.inicio);
  const bio = parseSection("bio", drafts.bio);
  const proposals = parseSection("propostas", drafts.propostas);
  const gallery = parseSection("galeria", drafts.galeria);
  const contact = parseSection("contato", drafts.contato);

  const next: Partial<{ [K in SectionKey]: SectionPayloads[K] }> = {
    inicio: {
      ...hero,
      title: t.inicio.title,
      body: t.inicio.body,
      ctas: t.inicio.ctas,
      image: t.inicio.image,
    },
    bio: {
      ...bio,
      header: { ...bio.header, title: t.bio.header.title },
      paragraphs: t.bio.paragraphs,
      image: { ...bio.image, alt: t.bio.image.alt, focal: t.bio.image.focal },
    },
    propostas: {
      ...proposals,
      header: { ...proposals.header, title: t.propostas.header.title, lead: t.propostas.header.lead },
      // Etiqueta e fonte ficam como estão: a equipe decidiu mantê-las.
      items: proposals.items.map((item) => {
        const n = byId(t.propostas.items, item.id);
        return n ? { ...item, title: n.title, summary: n.summary, body: n.body, icon: n.icon } : item;
      }),
    },
    galeria: {
      ...gallery,
      header: { ...gallery.header, title: t.galeria.header.title, lead: t.galeria.header.lead },
      videosTitle: t.galeria.videosTitle,
      photos: gallery.photos.map((photo) => {
        const n = byId(t.galeria.photos, photo.id);
        return n ? { ...photo, caption: n.caption, image: { ...photo.image, alt: n.image.alt } } : photo;
      }),
      videos: gallery.videos.map((video) => {
        const n = byId(t.galeria.videos, video.id);
        return n ? { ...video, caption: n.caption } : video;
      }),
    },
    contato: {
      ...contact,
      header: { ...contact.header, title: t.contato.header.title, lead: t.contato.header.lead },
      instagramActionLabel: t.contato.instagramActionLabel,
      whatsappActionLabel: t.contato.whatsappActionLabel,
    },
  };

  // Tudo validado antes de gravar qualquer coisa: ou entra tudo, ou nada.
  const settingsCheck = settingsSchema.safeParse(s1);
  if (!settingsCheck.success) throw new Error(`Configurações importadas inválidas: ${settingsCheck.error.message}`);
  for (const [key, payload] of Object.entries(next) as [SectionKey, unknown][]) {
    const check = SECTION_PAYLOAD_SCHEMAS[key].safeParse(payload);
    if (!check.success) throw new Error(`Seção "${key}" importada inválida: ${check.error.message}`);
  }

  // ---------------- relatório ----------------
  const report: [string, unknown, unknown][] = [
    ["configurações", s0, s1],
    ["inicio", hero, next.inicio],
    ["bio", bio, next.bio],
    ["propostas", proposals, next.propostas],
    ["galeria", gallery, next.galeria],
    ["contato", contact, next.contato],
  ];

  let total = 0;
  for (const [part, before, after] of report) {
    const paths = diff(before, after);
    total += paths.length;
    console.log(`\n${part}: ${paths.length ? `${paths.length} campo(s)` : "sem mudança"}`);
    for (const path of paths.slice(0, 14)) {
      console.log(`  ${path}\n      ${short(get(before, path))}\n    → ${short(get(after, path))}`);
    }
    if (paths.length > 14) console.log(`  … e mais ${paths.length - 14}`);
  }

  if (!apply) {
    console.log(`\n${total} campo(s) mudariam. Simulação — nada foi gravado.`);
    console.log("Para gravar os rascunhos: pnpm --filter painel importar-textos --aplicar");
    return;
  }

  if (diff(s0, s1).length) await saveSettingsDraft(db, s1, AUTHOR);
  for (const [part, before, after] of report.slice(1)) {
    if (diff(before, after).length) {
      await saveSectionDraft(db, part as SectionKey, after as never, AUTHOR);
    }
  }

  console.log(`\n${total} campo(s) gravados como RASCUNHO.`);
  console.log("O site no ar não mudou. Revise no painel e publique pela tela de Conteúdo.");
  console.log(
    "Atenção: o painel em produção também passa a mostrar esses rascunhos como pendentes.\n" +
      "Não publique antes do deploy do layout novo — o texto novo apareceria no layout antigo.",
  );
}

// Sem await de topo: este pacote não é ESM, e o tsx transpila para CJS.
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
