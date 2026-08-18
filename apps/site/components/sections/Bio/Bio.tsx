import Image from "next/image";
import { Fragment } from "react";
import type { SiteContent } from "@campanha/content";
import { imageProps } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Bio.module.css";

/** Converte os trechos entre ** do texto em <strong>, sem injetar HTML. */
function renderParagraph(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={i}>{chunk}</strong>
    ) : (
      <Fragment key={i}>{chunk}</Fragment>
    ),
  );
}

export function Bio({ content }: { content: SiteContent }) {
  const { bio } = content;

  return (
    <section id="bio" className="section">
      <div className="wrap">
        <div className={styles.grid}>
          <Reveal>
            <div className={styles.figure}>
              <Image
                {...imageProps(bio.image)}
                alt={bio.image.alt}
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 36rem"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="eyebrow">{bio.header.eyebrow}</p>
            <h2 className="section-title">
              {`${bio.header.title.lead} `}
              <span className="text-gradient">{bio.header.title.accent}</span>
            </h2>

            <div className={styles.body}>
              {bio.paragraphs.map((paragraph) => (
                <p key={paragraph.id}>{renderParagraph(paragraph.text)}</p>
              ))}
            </div>

            <dl className={styles.stats}>
              {bio.stats.map((stat) => (
                <div key={stat.id} className="surface-card">
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
