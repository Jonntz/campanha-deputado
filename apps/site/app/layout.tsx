// Primeiro: os CSS Modules dos componentes precisam vir depois dos utilitários
// globais para vencer os empates de especificidade.
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { navLinks, whatsappHref, type SiteContent } from "@campanha/content";
import { Analytics } from "@/components/analytics/Analytics";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VLibras } from "@/components/layout/VLibras";
import { getSiteContent, getSiteData } from "@/lib/content";
import { amsi } from "./fonts";

/** "Matheus Biancardine 3055" — o número entra onde o nome aparece sozinho. */
function displayName({ identity }: SiteContent): string {
  return [identity.name, identity.number].filter(Boolean).join(" ");
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const { identity, seo } = content;
  const name = displayName(content);
  const title = `${name} — ${identity.tagline}`;

  return {
    metadataBase: new URL(identity.url),
    title,
    description: seo.description,
    keywords: [...seo.keywords],
    authors: [{ name: identity.name }],
    openGraph: {
      title,
      description: seo.ogDescription,
      type: "website",
      locale: "pt_BR",
      url: identity.url,
      siteName: name,
      images: [
        {
          url: seo.ogImage.url,
          width: seo.ogImage.width,
          height: seo.ogImage.height,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: seo.description,
      images: [seo.ogImage.url],
    },
    alternates: { canonical: "/" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { seo } = await getSiteContent();
  return { themeColor: seo.themeColor };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { content, sections } = await getSiteData();
  const { ui } = content;

  // Uma seção oculta não pode continuar no menu: o link apontaria para uma
  // âncora que não existe no DOM, e o scrollspy pararia de encontrá-la.
  const visible = new Set(
    sections.filter((slot) => slot.visible).map((slot) => slot.key),
  );
  const links = navLinks(content).filter((link) => visible.has(link.key));

  return (
    // data-scroll-behavior: a partir do Next 16 o smooth scroll deixou de ser
    // aplicado automaticamente e precisa ser declarado aqui.
    <html lang="pt-BR" data-scroll-behavior="smooth" className={amsi.variable}>
      <head>
        {/* Sem JS o IntersectionObserver não roda: o conteúdo animado ficaria
            invisível para leitores e crawlers sem script. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          {ui.skipToContent}
        </a>

        {/* Os rótulos do menu são opcionais no schema (entraram depois do
            primeiro deploy); na falta, reaproveitam textos que já existem em
            vez de cair em frase fixa no código. */}
        <SiteHeader
          content={{
            navAriaLabel: content.nav.ariaLabel,
            links,
            logoAlt: displayName(content),
            ctaLabel: content.nav.ctaLabel,
            donationUrl: content.identity.donation.url,
            whatsappUrl: whatsappHref(content),
            openMenuLabel: ui.openMenu,
            closeMenuLabel: ui.closeMenu,
            menuTitle: ui.menuTitle ?? content.identity.name,
            menuWhatsapp: ui.menuWhatsapp ?? content.contact.whatsappActionLabel,
            menuDonate: ui.menuDonate ?? content.nav.ctaLabel,
          }}
        />

        <main id="main-content">{children}</main>

        <SiteFooter content={content} />
        <FloatingActions content={content} />
        <VLibras />

        <Analytics content={content} />
      </body>
    </html>
  );
}
