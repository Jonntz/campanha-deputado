import Image from "next/image";
import type { SiteContent } from "@campanha/content";
import { focalToObjectPosition } from "@campanha/content";
import { imageProps } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";
import { DownloadIcon } from "@/components/ui/icons";
import styles from "./CheatSheet.module.css";

export function CheatSheet({ content }: { content: SiteContent }) {
  const { cheatSheet } = content;

  return (
    <section id="colinha" className={`section ${styles.section}`} style={{ marginBottom: 50 }}>
      <div className="container">
        <Reveal>
          <div className={styles.card}>
            <div className={styles.figure}>
              {/* O amarelo fica atrás do recorte: a foto tem fundo
                  transparente e precisa de uma cor dentro do círculo. */}
              <div className={styles.circle}>
                <Image
                  {...imageProps(cheatSheet.image)}
                  alt={cheatSheet.image.alt}
                  fill
                  sizes="180px"
                  style={{
                    objectFit: "cover",
                    objectPosition:
                      focalToObjectPosition(cheatSheet.image.focal) ?? "50% 6%",
                  }}
                />
              </div>
              {/* {identity.number ? (
                <strong className={styles.number}>{identity.number}</strong>
              ) : null} */}
            </div>

            <div className={styles.copy}>
              <h2 className="heading">
                {cheatSheet.header.title.lead}
                <br />
                {cheatSheet.header.title.accent}
              </h2>
              {cheatSheet.header.lead ? (
                <p className={styles.subtitle}>{cheatSheet.header.lead}</p>
              ) : null}
            </div>

            {/* Arquivo da própria origem (`/colinha.png` em public/): o
                atributo `download` basta e a pessoa não sai da página. Se um dia
                o arquivo vier de outro domínio, o navegador ignora o `download`
                e abre em vez de baixar. */}
            <a
              className={`button button--yellow ${styles.action}`}
              href={cheatSheet.file}
              download
            >
              <DownloadIcon size={22} />
              {cheatSheet.buttonLabel}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
