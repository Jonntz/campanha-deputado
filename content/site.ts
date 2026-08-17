/**
 * Fonte única de verdade dos dados institucionais.
 * Trocar o WhatsApp aqui atualiza os 3 pontos onde ele aparece no site.
 */

const WHATSAPP_E164 = "5531996965298";

/**
 * IDs de rastreamento. Ficam em variáveis de ambiente NEXT_PUBLIC_* para que
 * produção, homologação e desenvolvimento possam usar contas diferentes sem
 * mexer no código. Sem valor definido, a tag correspondente não é carregada.
 *
 * Ao adicionar uma nova tag, inclua o domínio dela na CSP em next.config.ts —
 * caso contrário o navegador bloqueia o script.
 */
export const analytics = {
  googleTagId: process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "G-JXEBVJVR0M",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
};

export const site = {
  name: "Matheus Biancardine",
  brand: { lead: "Minas", accent: "é o mundo" },
  role: "Pré-candidato a Deputado Federal",
  tagline: "Tolerância zero por Minas",
  state: "Minas Gerais",
  url: "https://www.matheusbiancardine.com.br",

  whatsapp: {
    display: "(31) 99696-5298",
    href: `https://wa.me/${WHATSAPP_E164}`,
  },
  instagram: {
    handle: "@matheus.biancardine",
    href: "https://instagram.com/matheus.biancardine",
  },
  donation: {
    href: "https://queroapoiar.com.br/matheusbiancardine",
  },
} as const;

export type NavItem = { href: string; label: string };

export const navItems: readonly NavItem[] = [
  { href: "#inicio", label: "Início" },
  { href: "#bio", label: "Biografia" },
  { href: "#propostas", label: "Propostas" },
  { href: "#galeria", label: "Galeria" },
  { href: "#contato", label: "Contato" },
] as const;
