import Image from "next/image";
import heroPortrait from "@/assets/images/hero-matheus.jpg";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowDownIcon, HeartIcon } from "@/components/ui/icons";
import { HeroCurtain } from "./HeroCurtain";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="inicio" className={styles.hero}>
      <div className={`glow ${styles.glow}`} aria-hidden="true" />

      <div className="wrap">
        <div className={styles.grid}>
          <Reveal>
            <p className={styles.badge}>Minas Gerais · 2026</p>

            <h1 className={styles.title}>
              Tolerância zero
              <br />
              por <span className="text-gradient">Minas.</span>
            </h1>

            <p className={styles.subtitle}>
              Pré-candidato a Deputado Federal por Minas Gerais
            </p>

            <p className={styles.text}>
              Enquanto a velha política passa pano pro crime, eu defendo o fim da
              saidinha, leis mais rígidas e cadeia para quem recruta jovens para o
              tráfico. Minas sempre foi terra de gente trabalhadora e de bem. Vai
              continuar sendo.
            </p>

            <div className={styles.actions}>
              <a href="#contato" className="btn btn--primary pulse-cta">
                Apoio essa luta
                <HeartIcon size={16} />
              </a>
              <a href="#propostas" className="btn btn--ghost">
                Minhas propostas
                <ArrowDownIcon size={16} />
              </a>
            </div>
          </Reveal>

          <div className={styles.portrait}>
            <div className={styles.portraitGlow} aria-hidden="true" />
            <div className={styles.frame}>
              <Image
                src={heroPortrait}
                alt="Matheus Biancardine, pré-candidato a Deputado Federal por Minas Gerais"
                sizes="(max-width: 1023px) calc(100vw - 2.5rem), 40rem"
                placeholder="blur"
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
