/**
 * Registro estrutural das seções.
 *
 * Nada aqui é editável pelo painel. A âncora é o contrato entre o `id` no DOM,
 * o `useScrollSpy` e o `href` da navegação: deixar um editor renomeá-la
 * quebraria a navegação sem nenhum erro visível. O painel edita o rótulo, a
 * ordem e a visibilidade — a âncora é derivada daqui.
 */

export const SECTION_KEYS = [
  "inicio",
  "credenciais",
  "bio",
  "propostas",
  "galeria",
  "contato",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type SectionMeta = {
  /** `id` do <section>. Null quando a seção não é alvo de âncora. */
  anchor: string | null;
  /** Pode aparecer na navegação. */
  navigable: boolean;
  /** Pode ser ocultada pelo painel. */
  canHide: boolean;
};

export const SECTION_REGISTRY: Record<SectionKey, SectionMeta> = {
  // Não pode ser ocultada: é o alvo do link da marca e o estado inicial do
  // scrollspy.
  inicio: { anchor: "inicio", navigable: true, canHide: false },
  // O carrossel de credenciais nunca teve id nem entrada na navegação.
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
