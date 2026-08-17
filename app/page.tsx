import { Bio } from "@/components/sections/Bio/Bio";
import { Contact } from "@/components/sections/Contact/Contact";
import { Credentials } from "@/components/sections/Credentials/Credentials";
import { Gallery } from "@/components/sections/Gallery/Gallery";
import { Hero } from "@/components/sections/Hero/Hero";
import { Proposals } from "@/components/sections/Proposals/Proposals";
import { personJsonLd } from "@/lib/jsonLd";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Credentials />
      <Bio />
      <Proposals />
      <Gallery />
      <Contact />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}
