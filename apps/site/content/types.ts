import type { StaticImageData } from "next/image";
import type { IconName } from "@/components/ui/icons";

/**
 * Formato do documento de conteúdo do site.
 *
 * Este é o contrato que o painel administrativo edita e que o site consome.
 * Em `content/fallback.ts` ele existe como dado estático; a partir da Fase 3
 * a versão publicada vem do banco e este arquivo passa a ser a rede de
 * segurança usada quando o banco está indisponível.
 *
 * Regra que sustenta o desenho: nada aqui pode ser um componente React ou
 * outro valor não-serializável — o documento precisa sobreviver a JSON.
 */

/**
 * Âncoras das seções. Nunca são editáveis: `SiteHeader` deriva os alvos do
 * scrollspy a partir daqui e `useScrollSpy` chama getElementById com estes
 * valores. Um id renomeado no painel quebraria a navegação em silêncio.
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

/**
 * Ponto focal do recorte, em porcentagem — o que vira `object-position`.
 *
 * Existe porque as imagens são cortadas por `object-fit: cover` dentro de
 * proporções fixas no CSS (3/2 e 4/5 no Hero, 4/5 na Bio e na galeria, círculo
 * nas credenciais). Quem troca uma foto pelo painel não controla o
 * enquadramento — controla para onde o corte deve puxar.
 */
export type Focal = { x: number; y: number };

/** Fase 3: `source` dá lugar a `{ url, width, height, blurDataURL }` do Blob. */
export type MediaImage = {
  source: StaticImageData;
  alt: string;
  focal?: Focal;
  /** Só o Hero usa: o recorte muda a partir de 1024px, junto do aspect-ratio. */
  focalLg?: Focal;
};

/**
 * Título partido em duas metades: a segunda recebe `.text-gradient`.
 * Mesmo padrão que já existia em `site.brand` ("Minas" + "é o mundo").
 */
export type SplitTitle = {
  lead: string;
  accent: string;
};

export type SectionHeader = {
  eyebrow: string;
  title: SplitTitle;
  lead?: string;
};

export type Identity = {
  name: string;
  role: string;
  tagline: string;
  state: string;
  url: string;
  brand: SplitTitle;
  whatsapp: { display: string; e164: string };
  instagram: { handle: string; url: string };
  donation: { url: string };
};

export type Seo = {
  description: string;
  ogDescription: string;
  jsonLdDescription: string;
  keywords: readonly string[];
  themeColor: string;
  ogImage: { url: string; width: number; height: number };
};

export type NavContent = {
  ariaLabel: string;
  items: readonly { sectionKey: SectionKey; label: string; visible: boolean }[];
  ctaLabel: string;
  ribbon: { text: string; linkLabel: string };
};

export type HeroCta = {
  id: string;
  label: string;
  target: SectionKey;
  icon: IconName;
  variant: "primary" | "ghost";
};

export type Hero = {
  badge: string;
  /** Renderiza uma linha por item, com `accent` colado ao fim da última. */
  title: { lines: readonly string[]; accent: string };
  subtitle: string;
  body: string;
  ctas: readonly HeroCta[];
  image: MediaImage;
};

export type CredentialItem = {
  id: string;
  /** O recorte circular vem de `image.focal`: mantém o rosto no centro. */
  image: MediaImage;
  title: string;
  text: string;
};

export type Credentials = {
  ariaLabel: string;
  items: readonly CredentialItem[];
};

export type Bio = {
  header: SectionHeader;
  image: MediaImage;
  /** O texto aceita **negrito**, convertido em <strong> sem injetar HTML. */
  paragraphs: readonly { id: string; text: string }[];
  stats: readonly { id: string; value: string; label: string }[];
};

export type ProposalItem = {
  id: string;
  tag: string;
  title: string;
  body: string;
  source: string;
  icon: IconName;
};

export type Proposals = {
  header: SectionHeader;
  items: readonly ProposalItem[];
};

export type GalleryPhoto = {
  id: string;
  image: MediaImage;
  caption: string;
};

export type EventVideo = {
  id: string;
  /** Ficam em public/: <video src> e poster precisam de URL direta. */
  src: string;
  poster: string;
  caption: string;
};

export type Gallery = {
  header: SectionHeader;
  photos: readonly GalleryPhoto[];
  videosTitle: string;
  videos: readonly EventVideo[];
};

export type Contact = {
  header: SectionHeader;
  whatsappLabel: string;
  instagramLabel: string;
  instagramActionLabel: string;
  whatsappActionLabel: string;
};

export type Footer = {
  brand: SplitTitle;
};

export type Analytics = {
  googleTagId: string;
  metaPixelId: string;
};

/**
 * Rótulos de interface e acessibilidade. Ficam agrupados aqui, e não junto do
 * conteúdo editorial, porque são editados raramente e num lugar só — mas
 * continuam editáveis, sem exceção.
 */
export type UiLabels = {
  skipToContent: string;
  openMenu: string;
  closeMenu: string;
  previousCredential: string;
  nextCredential: string;
  credentialDots: string;
  /** Prefixo do rótulo de cada bolinha do carrossel: "Ir para <título>". */
  goToCredential: string;
  expandProposal: string;
  collapseProposal: string;
  proposalSource: string;
  /** Prefixo do botão de cada foto: "Ampliar foto: <legenda>". */
  enlargePhoto: string;
  videoFallback: string;
  lightboxLabel: string;
  lightboxClose: string;
  carouselRoleDescription: string;
};

export type SiteContent = {
  identity: Identity;
  seo: Seo;
  nav: NavContent;
  hero: Hero;
  credentials: Credentials;
  bio: Bio;
  proposals: Proposals;
  gallery: Gallery;
  contact: Contact;
  footer: Footer;
  analytics: Analytics;
  ui: UiLabels;
};
