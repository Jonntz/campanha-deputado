import Image from "next/image";
import { Fragment } from "react";
import type { SiteContent } from "@campanha/content";
import { sectionHref } from "@campanha/content";
import { imageProps } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";
import { ICONS } from "@/components/ui/icons";
import { HeroCurtain } from "./HeroCurtain";
import styles from "./Hero.module.css";

export function Hero({ content }: { content: SiteContent }) {
  const { hero } = content;
  const lastLine = hero.title.lines.length - 1;

  return (
    <section id="inicio" className={styles.hero}>
      <div className={`glow ${styles.glow}`} aria-hidden="true" />

      <div className="wrap">
        <div className={styles.grid}>
          <Reveal>
            <p className={styles.badge}>{hero.badge}</p>

            {/* O espaço final entra na última linha em vez de virar um nó de
                texto próprio: nós de texto adjacentes fazem o React emitir um
                separador <!-- --> no HTML. */}
            <h1 className={styles.title}>
              {hero.title.lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {index === lastLine ? `${line} ` : line}
                </Fragment>
              ))}
              <span className="text-gradient">{hero.title.accent}</span>
            </h1>

            <p className={styles.subtitle}>{hero.subtitle}</p>

            <p className={styles.text}>{hero.body}</p>

            <div className={styles.actions}>
              {hero.ctas.map((cta) => {
                const Icon = ICONS[cta.icon];
                return (
                  <a
                    key={cta.id}
                    href={sectionHref(cta.target) ?? "#inicio"}
                    className={
                      cta.variant === "primary"
                        ? "btn btn--primary pulse-cta"
                        : "btn btn--ghost"
                    }
                  >
                    {cta.label}
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </Reveal>

          <div className={styles.portrait}>
            <div className={styles.portraitGlow} aria-hidden="true" />
            <div className={styles.frame}>
              <Image
                {...imageProps(hero.image)}
                alt={hero.image.alt}
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 40rem"
                preload
                loading="eager"
              />
              <HeroCurtain />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
