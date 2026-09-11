import Image from "next/image";
import type { SiteContent } from "@campanha/content";
import { focalToObjectPosition, parseBold } from "@campanha/content";
import { imageProps } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Bio.module.css";

/** Trechos entre ** viram <strong>, sem injetar HTML — o mesmo parser do painel. */
function renderParagraph(text: string) {
  return parseBold(text).map((chunk, index) =>
    chunk.bold ? <strong key={index}>{chunk.text}</strong> : chunk.text,
  );
}

export function Bio({ content }: { content: SiteContent }) {
  const { bio } = content;

  return (
    <section id="bio" className={`section container ${styles.about}`}>
      <Reveal>
        <div className={styles.photo}>
          <Image
            {...imageProps(bio.image)}
            alt={bio.image.alt}
            fill
            sizes="(max-width: 600px) calc(100vw - 40px), 520px"
            style={{
              objectFit: "cover",
              objectPosition: focalToObjectPosition(bio.image.focal) ?? "50% 10%",
            }}
          />
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className={styles.copy}>
          <h2 className="heading">
            {bio.header.title.lead}
            <br />
            {bio.header.title.accent}
          </h2>
          {bio.paragraphs.map((paragraph) => (
            <p key={paragraph.id}>{renderParagraph(paragraph.text)}</p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
