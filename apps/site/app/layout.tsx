import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/analytics/Analytics";
import { DonationRibbon } from "@/components/layout/DonationRibbon";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VLibras } from "@/components/layout/VLibras";
import { navLinks } from "@campanha/content";
import { getSiteData, getSiteContent } from "@/lib/content";
import { barlow, barlowCondensed } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { identity, seo } = await getSiteContent();
  const title = `${identity.name} — ${identity.tagline}`;

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
      siteName: identity.name,
      images: [
        {
          url: seo.ogImage.url,
          width: seo.ogImage.width,
          height: seo.ogImage.height,
          alt: identity.name,
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

  // Uma seção oculta não pode continuar no menu: o link apontaria para uma
  // âncora que não existe no DOM, e o scrollspy pararia de encontrá-la.
  const visible = new Set(
    sections.filter((slot) => slot.visible).map((slot) => slot.key),
  );
  const links = navLinks(content).filter((link) => visible.has(link.key));

  return (
    // data-scroll-behavior: a partir do Next 16 o smooth scroll deixou de ser
    // aplicado automaticamente e precisa ser declarado aqui.
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
    >
      <head>
        {/* Sem JS o IntersectionObserver não roda: o conteúdo animado ficaria
            invisível para leitores e crawlers sem script. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main-content" className="sr-only">
          {content.ui.skipToContent}
        </a>

        <SiteHeader
          content={{
            navAriaLabel: content.nav.ariaLabel,
            links,
            brand: content.identity.brand,
            ctaLabel: content.nav.ctaLabel,
            donationUrl: content.identity.donation.url,
            openMenuLabel: content.ui.openMenu,
            closeMenuLabel: content.ui.closeMenu,
          }}
        >
          <DonationRibbon content={content} />
        </SiteHeader>

        <main id="main-content">{children}</main>

        <SiteFooter content={content} />
        <FloatingActions content={content} />
        <VLibras />

        <Analytics content={content} />
      </body>
    </html>
  );
}
