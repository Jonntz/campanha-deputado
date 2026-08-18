import { z } from "zod";
import { ICON_NAMES, PROPOSAL_ICON_NAMES } from "./icons";
import { SECTION_KEYS } from "./sections";
import { hasBalancedBold } from "./text";

/**
 * Contrato do conteúdo do site.
 *
 * É o mesmo schema nas duas pontas: o painel valida antes de gravar e o site
 * valida ao ler. A validação na leitura é defensiva — o painel é o único
 * escritor, mas uma edição manual via `turso db shell` não pode ser capaz de
 * derrubar o site.
 *
 * Nada aqui pode ser um componente React ou outro valor não-serializável: o
 * documento precisa sobreviver a uma ida e volta por JSON.
 */

const trimmed = (max: number) => z.string().trim().min(1).max(max);

/**
 * Ponto focal do recorte, em porcentagem — vira `object-position`.
 *
 * As imagens são cortadas por `object-fit: cover` dentro de proporções fixas
 * no CSS. Quem troca uma foto pelo painel não controla o enquadramento;
 * controla para onde o corte deve puxar.
 */
export const focalSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const mediaRefSchema = z.object({
  /** Null enquanto a imagem é import estático; id da biblioteca depois. */
  mediaId: z.string().nullable().default(null),
  url: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().startsWith("data:image/").optional(),
  /**
   * Dimensões da miniatura do blur, não da imagem.
   *
   * O Next monta o placeholder com `viewBox = blurWidth * 40` e aplica um
   * desfoque fixo de stdDeviation 20 em unidades desse viewBox. Sem estes
   * campos ele cai para a largura real da imagem e o desfoque fica várias
   * vezes mais fraco — o placeholder aparece pixelado em vez de borrado.
   */
  blurWidth: z.number().int().positive().optional(),
  blurHeight: z.number().int().positive().optional(),
  alt: trimmed(300),
  focal: focalSchema.optional(),
  /** Só o Hero usa: o recorte muda junto do aspect-ratio a partir de 1024px. */
  focalLg: focalSchema.optional(),
});

/** Título partido: a segunda metade recebe `.text-gradient`. */
export const splitTitleSchema = z.object({
  lead: trimmed(120),
  accent: trimmed(120),
});

export const sectionHeaderSchema = z.object({
  eyebrow: trimmed(60),
  title: splitTitleSchema,
  lead: z.string().trim().max(400).optional(),
});

/** Texto com a micro-sintaxe **negrito**. */
const richText = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .refine(hasBalancedBold, { message: "Marcação ** desbalanceada" });

export const identitySchema = z.object({
  name: trimmed(120),
  role: trimmed(120),
  tagline: trimmed(160),
  state: trimmed(60),
  url: z.url(),
  brand: splitTitleSchema,
  whatsapp: z.object({
    display: trimmed(40),
    /** Só dígitos, com DDI: é o que monta o link do wa.me. */
    e164: z.string().regex(/^\d{10,15}$/, "Use apenas dígitos, com DDI"),
  }),
  instagram: z.object({ handle: trimmed(60), url: z.url() }),
  donation: z.object({ url: z.url() }),
});

export const seoSchema = z.object({
  description: trimmed(320),
  ogDescription: trimmed(320),
  jsonLdDescription: trimmed(500),
  keywords: z.array(trimmed(60)).max(20),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use hexadecimal, ex. #12303c"),
  ogImage: z.object({
    url: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
});

export const navSchema = z.object({
  ariaLabel: trimmed(80),
  items: z
    .array(
      z.object({
        sectionKey: z.enum(SECTION_KEYS),
        label: trimmed(40),
        visible: z.boolean(),
      }),
    )
    .min(1),
  ctaLabel: trimmed(60),
  ribbon: z.object({ text: trimmed(120), linkLabel: trimmed(30) }),
});

export const heroSchema = z.object({
  badge: trimmed(60),
  /** Uma linha por item; `accent` cola no fim da última. */
  title: z.object({
    lines: z.array(trimmed(80)).min(1).max(3),
    accent: trimmed(80),
  }),
  subtitle: trimmed(200),
  body: richText,
  ctas: z
    .array(
      z.object({
        id: trimmed(40),
        label: trimmed(60),
        target: z.enum(SECTION_KEYS),
        icon: z.enum(ICON_NAMES),
        variant: z.enum(["primary", "ghost"]),
      }),
    )
    .max(3),
  image: mediaRefSchema,
});

export const credentialsSchema = z.object({
  ariaLabel: trimmed(80),
  // O carrossel indexa com módulo do tamanho: uma lista vazia não renderiza.
  items: z
    .array(
      z.object({
        id: trimmed(60),
        image: mediaRefSchema,
        title: trimmed(120),
        text: trimmed(400),
      }),
    )
    .min(1),
});

export const bioSchema = z.object({
  header: sectionHeaderSchema,
  image: mediaRefSchema,
  paragraphs: z
    .array(z.object({ id: trimmed(60), text: richText }))
    .min(1),
  stats: z
    .array(
      z.object({ id: trimmed(60), value: trimmed(20), label: trimmed(80) }),
    )
    .max(4),
});

export const proposalsSchema = z.object({
  header: sectionHeaderSchema,
  items: z.array(
    z.object({
      id: trimmed(60),
      tag: trimmed(40),
      title: trimmed(120),
      // O card renderiza o corpo num <p> só e mede scrollHeight para expandir.
      body: z.string().trim().min(1).max(4000),
      source: trimmed(80),
      icon: z.enum(PROPOSAL_ICON_NAMES),
    }),
  ),
});

export const gallerySchema = z.object({
  header: sectionHeaderSchema,
  photos: z.array(
    z.object({ id: trimmed(60), image: mediaRefSchema, caption: trimmed(300) }),
  ),
  videosTitle: trimmed(80),
  videos: z.array(
    z.object({
      id: trimmed(60),
      src: z.string().min(1),
      poster: z.string().min(1),
      caption: trimmed(300),
    }),
  ),
});

export const contactSchema = z.object({
  header: sectionHeaderSchema,
  whatsappLabel: trimmed(40),
  instagramLabel: trimmed(40),
  instagramActionLabel: trimmed(60),
  whatsappActionLabel: trimmed(60),
});

export const footerSchema = z.object({ brand: splitTitleSchema });

export const analyticsSchema = z.object({
  googleTagId: z.string().trim().max(40),
  metaPixelId: z.string().trim().max(40),
});

/**
 * Rótulos de interface e acessibilidade. Agrupados à parte do conteúdo
 * editorial porque mudam raramente — mas continuam editáveis, sem exceção.
 */
export const uiLabelsSchema = z.object({
  skipToContent: trimmed(80),
  openMenu: trimmed(40),
  closeMenu: trimmed(40),
  previousCredential: trimmed(40),
  nextCredential: trimmed(40),
  credentialDots: trimmed(40),
  /** Prefixo do rótulo de cada bolinha: "Ir para <título>". */
  goToCredential: trimmed(40),
  expandProposal: trimmed(30),
  collapseProposal: trimmed(30),
  proposalSource: trimmed(30),
  /** Prefixo do botão de cada foto: "Ampliar foto: <legenda>". */
  enlargePhoto: trimmed(40),
  videoFallback: trimmed(160),
  lightboxLabel: trimmed(60),
  lightboxClose: trimmed(30),
  carouselRoleDescription: trimmed(30),
});

export const siteContentSchema = z.object({
  identity: identitySchema,
  seo: seoSchema,
  nav: navSchema,
  hero: heroSchema,
  credentials: credentialsSchema,
  bio: bioSchema,
  proposals: proposalsSchema,
  gallery: gallerySchema,
  contact: contactSchema,
  footer: footerSchema,
  analytics: analyticsSchema,
  ui: uiLabelsSchema,
});

export type Focal = z.infer<typeof focalSchema>;
export type MediaRef = z.infer<typeof mediaRefSchema>;
export type SplitTitle = z.infer<typeof splitTitleSchema>;
export type SectionHeader = z.infer<typeof sectionHeaderSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type Seo = z.infer<typeof seoSchema>;
export type NavContent = z.infer<typeof navSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type HeroCta = Hero["ctas"][number];
export type Credentials = z.infer<typeof credentialsSchema>;
export type CredentialItem = Credentials["items"][number];
export type Bio = z.infer<typeof bioSchema>;
export type Proposals = z.infer<typeof proposalsSchema>;
export type ProposalItem = Proposals["items"][number];
export type Gallery = z.infer<typeof gallerySchema>;
export type GalleryPhoto = Gallery["photos"][number];
export type EventVideo = Gallery["videos"][number];
export type Contact = z.infer<typeof contactSchema>;
export type Footer = z.infer<typeof footerSchema>;
export type Analytics = z.infer<typeof analyticsSchema>;
export type UiLabels = z.infer<typeof uiLabelsSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
