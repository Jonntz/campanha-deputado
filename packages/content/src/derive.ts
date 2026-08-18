import type { Focal, SiteContent } from "./schema";
import { SECTION_REGISTRY, type SectionKey } from "./sections";

/**
 * Valores derivados do conteúdo — nunca armazenados.
 *
 * O caso que importa é `navLinks`: guardar o `href` deixaria um item de
 * navegação apontar para uma âncora que não existe no DOM. Derivando do
 * registro de seções, isso deixa de ser possível.
 */

export type NavLink = { key: SectionKey; href: string; label: string };

export function navLinks(content: SiteContent): NavLink[] {
  return content.nav.items.flatMap((item) => {
    if (!item.visible) return [];
    const meta = SECTION_REGISTRY[item.sectionKey];
    if (!meta.navigable || !meta.anchor) return [];
    return [{ key: item.sectionKey, href: `#${meta.anchor}`, label: item.label }];
  });
}

export function whatsappHref(content: SiteContent): string {
  return `https://wa.me/${content.identity.whatsapp.e164}`;
}

/** `object-position` a partir do ponto focal. */
export function focalToObjectPosition(focal: Focal | undefined): string | undefined {
  return focal ? `${focal.x}% ${focal.y}%` : undefined;
}
