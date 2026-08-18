import { Bio } from "@/components/sections/Bio/Bio";
import { Contact } from "@/components/sections/Contact/Contact";
import { Credentials } from "@/components/sections/Credentials/Credentials";
import { Gallery } from "@/components/sections/Gallery/Gallery";
import { Hero } from "@/components/sections/Hero/Hero";
import { Proposals } from "@/components/sections/Proposals/Proposals";
import { getSiteContent } from "@/content";
import { personJsonLd } from "@/lib/jsonLd";

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <Hero content={content} />
      <Credentials
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
      <Bio content={content} />
      <Proposals content={content} />
      <Gallery content={content} />
      <Contact content={content} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(content)),
        }}
      />
    </>
  );
}
