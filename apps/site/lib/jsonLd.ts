import type { SiteContent } from "@campanha/content";

/**
 * Dados estruturados schema.org. Montado a partir de um objeto tipado e
 * serializado com JSON.stringify — não há entrada de usuário envolvida.
 */
export function personJsonLd(content: SiteContent) {
  const { identity, seo } = content;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    jobTitle: identity.role,
    url: identity.url,
    image: `${identity.url}${seo.ogImage.url}`,
    description: seo.jsonLdDescription,
    address: {
      "@type": "PostalAddress",
      addressRegion: "MG",
      addressCountry: "BR",
    },
    sameAs: [identity.instagram.url],
  } as const;
}
