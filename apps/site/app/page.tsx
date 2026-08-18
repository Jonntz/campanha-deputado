import { Bio } from "@/components/sections/Bio/Bio";
import { Contact } from "@/components/sections/Contact/Contact";
import { Credentials } from "@/components/sections/Credentials/Credentials";
import { Gallery } from "@/components/sections/Gallery/Gallery";
import { Hero } from "@/components/sections/Hero/Hero";
import { Proposals } from "@/components/sections/Proposals/Proposals";
import { getSiteData } from "@/lib/content";
import { personJsonLd } from "@/lib/jsonLd";

/**
 * Rede de segurança caso uma publicação não consiga avisar o site. A via normal
 * é o painel chamar /api/revalidate — este intervalo só cobre o caso em que
 * essa chamada se perde.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const { content, sections } = await getSiteData();

  return (
    <>
      {sections.map((slot) => {
        if (!slot.visible) return null;

        switch (slot.key) {
          case "inicio":
            return <Hero key={slot.key} content={content} />;
          case "credenciais":
            return (
              <Credentials
                key={slot.key}
                content={{
                  ariaLabel: content.credentials.ariaLabel,
                  items: content.credentials.items,
                  labels: {
                    previous: content.ui.previousCredential,
                    next: content.ui.nextCredential,
                    dots: content.ui.credentialDots,
                    goTo: content.ui.goToCredential,
                    roleDescription: content.ui.carouselRoleDescription,
                  },
                }}
              />
            );
          case "bio":
            return <Bio key={slot.key} content={content} />;
          case "propostas":
            return <Proposals key={slot.key} content={content} />;
          case "galeria":
            return <Gallery key={slot.key} content={content} />;
          case "contato":
            return <Contact key={slot.key} content={content} />;
        }
      })}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(content)),
        }}
      />
    </>
  );
}
