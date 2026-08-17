import Image from "next/image";
import { Fragment } from "react";
import quemMatheus from "@/assets/images/quem-matheus.jpeg";
import { bioParagraphs, bioStats } from "@/content/bio";
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

export function Bio() {
  return (
    <section id="bio" className="section">
      <div className="wrap">
        <div className={styles.grid}>
          <Reveal>
            <div className={styles.figure}>
              <Image
                src={quemMatheus}
                alt="Matheus Biancardine discursando ao microfone"
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 36rem"
                placeholder="blur"
              />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="eyebrow">Biografia</p>
            <h2 className="section-title">
              Quem é <span className="text-gradient">Matheus Biancardine?</span>
            </h2>

            <div className={styles.body}>
              {bioParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{renderParagraph(paragraph)}</p>
              ))}
            </div>

            <dl className={styles.stats}>
              {bioStats.map((stat) => (
                <div key={stat.value} className="surface-card">
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
