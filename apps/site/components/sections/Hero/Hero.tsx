import Image from "next/image";
import { Fragment } from "react";
import type { HeroCta, SiteContent } from "@campanha/content";
import { sectionHref, whatsappHref } from "@campanha/content";
import { ICONS } from "@/components/ui/icons";
import { imageProps } from "@/lib/media";
import styles from "./Hero.module.css";

/** Botão com `link` abre o destino externo; sem ele, rola até a seção. */
function destination(cta: HeroCta, content: SiteContent) {
  if (cta.link === "whatsapp") return { href: whatsappHref(content), external: true };
  if (cta.link === "donation") {
    return { href: content.identity.donation.url, external: true };
  }
  return { href: sectionHref(cta.target) ?? "#inicio", external: false };
}

export function Hero({ content }: { content: SiteContent }) {
  const { hero, identity } = content;

  return (
    <>
      <section id="inicio" className={styles.hero}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.copy}>
            <h1 className={styles.title}>
              <span className={styles.lead}>
                {hero.title.lines.map((line, index) => (
                  <Fragment key={index}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </Fragment>
                ))}
              </span>
              <br />
              <span className={styles.accent}>{hero.title.accent}</span>
            </h1>

            <p className={styles.body}>{hero.body}</p>

            {identity.number ? (
              <div className={styles.number}>
                <strong>{identity.number}</strong>
              </div>
            ) : null}

            <div className={styles.actions}>
              {hero.ctas.map((cta) => {
                const Icon = ICONS[cta.icon];
                const { href, external } = destination(cta, content);
                const target = external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {};

                // Primário: ícone antes do texto, como botão. Secundário:
                // link de texto, com a seta depois.
                return cta.variant === "primary" ? (
                  <a key={cta.id} href={href} className="button" {...target}>
                    <Icon size={22} />
                    {cta.label}
                  </a>
                ) : (
                  <a key={cta.id} href={href} className="text-link" {...target}>
                    {cta.label}
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className={styles.portrait}>
            <Image
              {...imageProps(hero.image)}
              alt={hero.image.alt}
              sizes="(max-width: 600px) 92vw, 580px"
              preload
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* A faixa de símbolos de Minas acompanha a abertura, e não uma seção:
          continua logo abaixo dela mesmo que o painel reordene o resto. */}
      <div className={styles.strip} aria-hidden="true">
        <Image
          src="/assets/divisor-matheus.webp"
          alt=""
          width={2160}
          height={258}
          sizes="100vw"
        />
      </div>
    </>
  );
}
