import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/analytics/Analytics";
import { DonationRibbon } from "@/components/layout/DonationRibbon";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VLibras } from "@/components/layout/VLibras";
import { site } from "@/content/site";
import { barlow, barlowCondensed } from "./fonts";
import "./globals.css";

const title = `${site.name} — ${site.tagline}`;
const description =
  "Pré-candidato a Deputado Federal por Minas Gerais. Fim da saidinha, leis mais rígidas e cadeia para quem recruta jovens para o tráfico.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  keywords: [
    site.name,
    "Deputado Federal",
    "Minas Gerais",
    "Segurança Pública",
    "Tolerância Zero",
    "MG 2026",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    title,
    description:
      "Pré-candidato a Deputado Federal por Minas Gerais. Enquanto a velha política passa pano pro crime, eu defendo Minas.",
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#12303c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
          Pular para o conteúdo principal
        </a>

        <SiteHeader>
          <DonationRibbon />
        </SiteHeader>

        <main id="main-content">{children}</main>

        <SiteFooter />
        <FloatingActions />
        <VLibras />

        <Analytics />
      </body>
    </html>
  );
}
