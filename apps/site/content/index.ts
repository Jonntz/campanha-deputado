import { fallbackContent } from "./fallback";
import { SECTION_KEYS, type SectionKey, type SiteContent } from "./types";

export type { SiteContent, SectionKey } from "./types";
export { SECTION_KEYS } from "./types";

/**
 * Metadados estruturais de cada seção. Não são editáveis pelo painel: a
 * âncora é o contrato entre o DOM, o `useScrollSpy` e os links da navegação.
 * Deixar o editor renomear um `href` quebraria o scrollspy em silêncio.
 *
 * `credenciais` é a única seção sem âncora — o carrossel não está na navegação
 * e o `<section>` correspondente nunca teve id.
 */
export const SECTION_REGISTRY: Record<
  SectionKey,
  { anchor: string | null; navigable: boolean; canHide: boolean }
> = {
  inicio: { anchor: "inicio", navigable: true, canHide: false },
  credenciais: { anchor: null, navigable: false, canHide: true },
  bio: { anchor: "bio", navigable: true, canHide: true },
  propostas: { anchor: "propostas", navigable: true, canHide: true },
  galeria: { anchor: "galeria", navigable: true, canHide: true },
  contato: { anchor: "contato", navigable: true, canHide: true },
};

/** Âncora de uma seção, já com `#`. Null para seções fora da navegação. */
export function sectionHref(key: SectionKey): string | null {
  const anchor = SECTION_REGISTRY[key].anchor;
  return anchor ? `#${anchor}` : null;
}

export type NavLink = { key: SectionKey; href: string; label: string };

/**
 * Links da navegação derivados do conteúdo — nunca armazenados.
 * É isto que impede um item de nav de apontar para uma âncora inexistente.
 */
export function navLinks(content: SiteContent): NavLink[] {
  return content.nav.items.flatMap((item) => {
    if (!item.visible) return [];
    const href = sectionHref(item.sectionKey);
    if (!href) return [];
    return [{ key: item.sectionKey, href, label: item.label }];
  });
}

export function whatsappHref(content: SiteContent): string {
  return `https://wa.me/${content.identity.whatsapp.e164}`;
}

/** `object-position` a partir do ponto focal. */
export function focalToObjectPosition(
  focal: { x: number; y: number } | undefined,
): string | undefined {
  return focal ? `${focal.x}% ${focal.y}%` : undefined;
}

/**
 * Ponto único de leitura do conteúdo.
 *
 * Hoje devolve o documento commitado. Na Fase 3 passa a consultar a versão
 * publicada no banco e a cair neste mesmo documento quando o banco falhar —
 * por isso já é async: os componentes não mudam quando o banco entrar.
 */
export async function getSiteContent(): Promise<SiteContent> {
  return fallbackContent;
}

export { fallbackContent };

/** Guarda de sanidade: o registro precisa cobrir todas as chaves. */
const _exhaustive: readonly SectionKey[] = SECTION_KEYS;
void _exhaustive;
