import { site } from "@/content/site";

/**
 * Dados estruturados schema.org. Montado a partir de um objeto tipado e
 * serializado com JSON.stringify — não há entrada de usuário envolvida.
 */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  image: `${site.url}/og-image.jpg`,
  description:
    "Matheus Biancardine é pré-candidato a Deputado Federal por Minas Gerais, com foco em segurança pública, oportunidades para a juventude e menos impostos.",
  address: {
    "@type": "PostalAddress",
    addressRegion: "MG",
    addressCountry: "BR",
  },
  sameAs: [site.instagram.href],
} as const;
